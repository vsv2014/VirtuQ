const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const { auth } = require('../middleware/auth.js');

const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log('Signup request:', { name, email, phone }); // Log request data

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });

    console.log('Created user object:', user); // Log user object

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in signup:', error); // Log detailed error
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login request:', { email }); // Log request data

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Found user:', user); // Log user object

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error); // Log detailed error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    console.log('Send OTP request:', { phone }); // Log request data

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, you would integrate with SMS service here
    console.log(`OTP for ${phone}: ${otp}`);

    // Save OTP to user document
    await User.findOneAndUpdate(
      { phone },
      { 
        $set: {
          otp,
          otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      },
      { upsert: true }
    );

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error); // Log detailed error
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    console.log('Verify OTP request:', { phone, otp }); // Log request data

    const user = await User.findOne({
      phone,
      otp,
      otpExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log('Found user:', user); // Log user object

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error); // Log detailed error
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Get current user request:', req.user.id); // Log request data

    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error); // Log detailed error
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;
