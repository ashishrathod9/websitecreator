const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Helper function to ensure database connection
const ensureDBConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
};

// Register route
router.post('/register', async (req, res) => {
  try {
    // Ensure database connection first
    await ensureDBConnection();
    
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists with explicit timeout and lean query
    const existingUser = await User.findOne({ email })
      .lean()
      .maxTimeMS(15000)
      .exec();
      
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with timeout
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Save with explicit timeout
    const savedUser = await user.save({ 
      maxTimeMS: 15000,
      wtimeout: 10000 
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific MongoDB errors
    if (error.name === 'MongoTimeoutError' || 
        error.name === 'MongooseError' || 
        error.message.includes('buffering timed out')) {
      return res.status(503).json({
        error: 'Database connection timeout. Please try again.',
        code: 'DB_TIMEOUT'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Email already exists',
        code: 'DUPLICATE_EMAIL' 
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.message === 'Database not connected') {
      return res.status(503).json({
        error: 'Service temporarily unavailable. Please try again.',
        code: 'DB_DISCONNECTED'
      });
    }

    res.status(500).json({
      error: 'Registration failed. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    // Ensure database connection first
    await ensureDBConnection();
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with timeout and select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .maxTimeMS(15000)
      .exec();
      
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    // Handle specific MongoDB errors
    if (error.name === 'MongoTimeoutError' || 
        error.name === 'MongooseError' || 
        error.message.includes('buffering timed out')) {
      return res.status(503).json({
        error: 'Database connection timeout. Please try again.',
        code: 'DB_TIMEOUT'
      });
    }

    if (error.message === 'Database not connected') {
      return res.status(503).json({
        error: 'Service temporarily unavailable. Please try again.',
        code: 'DB_DISCONNECTED'
      });
    }

    res.status(500).json({
      error: 'Login failed. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;