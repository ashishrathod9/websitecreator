const express = require('express');
const router = express.Router();
const College = require('../models/College');
const auth = require('../middleware/auth');

// Get all colleges
router.get('/', auth, async (req, res) => {
  try {
    const colleges = await College.find({ user: req.user.id });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single college
router.get('/:id', auth, async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, user: req.user.id });
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new college
router.post('/', auth, async (req, res) => {
  try {
    const college = new College({
      ...req.body,
      user: req.user.id
    });
    const savedCollege = await college.save();
    res.status(201).json(savedCollege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update college
router.put('/:id', auth, async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, user: req.user.id });
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Update all fields
    Object.keys(req.body).forEach(key => {
      college[key] = req.body[key];
    });

    const updatedCollege = await college.save();
    res.json(updatedCollege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete college
router.delete('/:id', auth, async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, user: req.user.id });
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    await college.remove();
    res.json({ message: 'College deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 