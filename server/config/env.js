import dotenv from 'dotenv';
import crypto from 'node:crypto';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

/**
 * In production a weak/missing JWT secret is fatal. In development we derive an
 * ephemeral one so `npm run server` works out of the box, but we say so loudly.
 */
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'your-secret-key') {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set to a strong random value in production.');
  }
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[env] JWT_SECRET is not set — generated an ephemeral development secret. ' +
      'Set JWT_SECRET before running in production.',
  );
}

export const env = {
  NODE_ENV,
  isProduction,
  PORT: Number(process.env.PORT || 3000),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/trynstyle',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  /** Extra origins allowed through CORS (comma separated). */
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  OTP_TTL_SECONDS: Number(process.env.OTP_TTL_SECONDS || 300),
};

export const allowedOrigins = [env.CLIENT_URL, ...env.ALLOWED_ORIGINS].filter(Boolean);
