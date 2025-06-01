const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'auth.log'), { flags: 'a' });

// Custom logging function
const log = (message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logMessage = JSON.stringify({
    timestamp,
    message,
    ...data
  });
  console.log(logMessage);
  logStream.write(logMessage + '\n');
};

// CORS middleware for auth routes
router.use((req, res, next) => {
  const allowedOrigins = ['https://websitecreator-ttdr.vercel.app', 'https://websitecreator-cgzt.vercel.app'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Register user
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    log('Registration request received:', { 
      name: req.body.name,
      email: req.body.email,
      hasPassword: !!req.body.password,
      headers: req.headers
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log('Validation errors:', { errors: errors.array() });
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;
    
    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        log('User already exists:', { email });
        return res.status(400).json({ 
          success: false,
          error: 'Email already registered' 
        });
      }
    } catch (findError) {
      log('Error checking existing user:', {
        error: findError.message,
        code: findError.code,
        name: findError.name,
        stack: findError.stack
      });
      return res.status(500).json({
        success: false,
        error: 'Error checking user existence'
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    
    try {
      await user.save();
      log('User saved successfully:', { userId: user._id });
    } catch (saveError) {
      log('Error saving user:', {
        error: saveError.message,
        code: saveError.code,
        name: saveError.name,
        stack: saveError.stack,
        validationErrors: saveError.errors
      });
      return res.status(500).json({
        success: false,
        error: 'Error creating user account'
      });
    }

    // Generate token
    let token;
    try {
      token = jwt.sign(
        { 
          userId: user._id,
          name: user.name,
          email: user.email
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      log('Token generated successfully');
    } catch (tokenError) {
      log('Error generating token:', {
        error: tokenError.message,
        stack: tokenError.stack
      });
      return res.status(500).json({
        success: false,
        error: 'Error generating authentication token'
      });
    }

    // Remove password from response
    const userResponse = user.toJSON();
    log('Registration successful for user:', { userId: user._id });

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    log('Registration error:', {
      error: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      mongooseState: mongoose.connection.readyState
    });
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerError') {
      return res.status(500).json({ 
        success: false,
        error: 'Database connection error. Please try again later.'
      });
    }
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user data provided'
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login' 
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

module.exports = router; 