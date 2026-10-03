import express from 'express';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { auth, signToken } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = express.Router();

const PHONE_RE = /^[6-9]\d{9}$/;
const OTP_RE = /^\d{6}$/;
const MAX_OTP_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 30;
const BCRYPT_ROUNDS = 10;

const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please try again later.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Please try again later.' },
});

/** Cryptographically random 6-digit code — never Math.random(). */
function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/**
 * POST /api/auth/otp/request
 * Generates a real 6-digit OTP, stores only its hash, and (outside production)
 * returns it so the flow is testable without an SMS gateway.
 */
router.post('/otp/request', otpRequestLimiter, async (req, res, next) => {
  try {
    const phone = String(req.body?.phone ?? '').trim();

    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }

    let user = await User.findOne({ phone }).select(
      '+otpHash +otpExpiresAt +lastOtpRequestedAt +otpAttempts',
    );
    const isNewUser = !user;

    if (!user) {
      user = new User({ phone });
    } else {
      const cooldownMs = OTP_COOLDOWN_SECONDS * 1000;
      const last = user.lastOtpRequestedAt?.getTime?.() ?? 0;
      if (Date.now() - last < cooldownMs) {
        const wait = Math.ceil((cooldownMs - (Date.now() - last)) / 1000);
        return res
          .status(429)
          .json({ message: `Please wait ${wait}s before requesting a new OTP` });
      }
    }

    const otp = generateOtp();
    user.otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
    user.otpExpiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);
    user.otpAttempts = 0;
    user.lastOtpRequestedAt = new Date();
    await user.save();

    // Never log the OTP in production.
    if (!env.isProduction) {
      console.info(`[auth] OTP for +91${phone}: ${otp}`);
    }

    return res.json({
      sent: true,
      isNewUser,
      expiresInSeconds: env.OTP_TTL_SECONDS,
      // Dev convenience only — the client autofills this field.
      ...(env.isProduction ? {} : { devCode: otp }),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/auth/otp/verify
 * Verifies the OTP against its bcrypt hash and issues a JWT.
 */
router.post('/otp/verify', otpVerifyLimiter, async (req, res, next) => {
  try {
    const phone = String(req.body?.phone ?? '').trim();
    const code = String(req.body?.code ?? '').trim();

    if (!PHONE_RE.test(phone) || !OTP_RE.test(code)) {
      return res
        .status(400)
        .json({ message: 'Enter a valid mobile number and 6-digit OTP' });
    }

    const user = await User.findOne({ phone }).select(
      '+otpHash +otpExpiresAt +otpAttempts',
    );

    if (!user?.otpHash) {
      return res.status(400).json({ message: 'Request an OTP first' });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Request a new one.' });
    }

    if ((user.otpAttempts ?? 0) >= MAX_OTP_ATTEMPTS) {
      return res
        .status(429)
        .json({ message: 'Too many incorrect attempts. Request a new OTP.' });
    }

    const matches = await bcrypt.compare(code, user.otpHash);
    if (!matches) {
      user.otpAttempts = (user.otpAttempts ?? 0) + 1;
      await user.save();
      return res.status(401).json({ message: 'Incorrect OTP' });
    }

    // One-time use.
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    return res.json({ token: signToken(user), user: user.toPublicJSON() });
  } catch (error) {
    return next(error);
  }
});

/** GET /api/auth/me */
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

/** PATCH /api/auth/me */
router.patch('/me', auth, async (req, res, next) => {
  try {
    const { name, email } = req.body ?? {};
    if (typeof name === 'string') req.user.name = name.trim();
    if (typeof email === 'string') req.user.email = email.trim().toLowerCase();
    await req.user.save();
    return res.json({ user: req.user.toPublicJSON() });
  } catch (error) {
    return next(error);
  }
});

/** GET /api/auth/addresses */
router.get('/addresses', auth, (req, res) => {
  res.json({ addresses: req.user.toPublicJSON().addresses });
});

/** POST /api/auth/addresses */
router.post('/addresses', auth, async (req, res, next) => {
  try {
    const address = req.body ?? {};
    if (address.isDefault) {
      req.user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    req.user.addresses.push(address);
    await req.user.save();
    return res.status(201).json({ addresses: req.user.toPublicJSON().addresses });
  } catch (error) {
    return next(error);
  }
});

/** PATCH /api/auth/addresses/:id */
router.patch('/addresses/:id', auth, async (req, res, next) => {
  try {
    const address = req.user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const allowed = [
      'name',
      'phone',
      'pincode',
      'city',
      'state',
      'locality',
      'building',
      'landmark',
      'type',
      'isDefault',
    ];
    for (const field of allowed) {
      if (field in (req.body ?? {})) address[field] = req.body[field];
    }
    if (address.isDefault) {
      req.user.addresses.forEach((a) => {
        if (a._id.toString() !== address._id.toString()) a.isDefault = false;
      });
    }

    await req.user.save();
    return res.json({ addresses: req.user.toPublicJSON().addresses });
  } catch (error) {
    return next(error);
  }
});

/** DELETE /api/auth/addresses/:id */
router.delete('/addresses/:id', auth, async (req, res, next) => {
  try {
    const address = req.user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    address.deleteOne();
    await req.user.save();
    return res.json({ addresses: req.user.toPublicJSON().addresses });
  } catch (error) {
    return next(error);
  }
});

export default router;
