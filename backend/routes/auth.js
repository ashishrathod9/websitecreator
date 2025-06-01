const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed
const mongoose = require('mongoose');

const router = express.Router();

// Helper function to handle database operations with retry
const withRetry = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists with retry logic
    const existingUser = await withRetry(async () => {
      return await User.findOne({ email }).lean().maxTimeMS(5000);
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with retry logic
    const user = await withRetry(async () => {
      const newUser = new User({
        name,
        email,
        password: hashedPassword
      });
      return await newUser.save();
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(503).json({ 
        error: 'Database connection issue. Please try again.' 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with retry logic
    const user = await withRetry(async () => {
      return await User.findOne({ email }).maxTimeMS(5000);
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(503).json({ 
        error: 'Database connection issue. Please try again.' 
      });
    }
    
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const user = await withRetry(async () => {
      return await User.findById(decoded.userId).select('-password').lean().maxTimeMS(5000);
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(503).json({ 
        error: 'Database connection issue. Please try again.' 
      });
    }
    
    res.status(500).json({ error: 'Server error during verification' });
  }
});

module.exports = router;