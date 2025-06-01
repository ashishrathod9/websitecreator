const express = require('express');
const router = express.Router();
const College = require('../models/College');

// Get all colleges
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single college
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new college
router.post('/', async (req, res) => {
  const college = new College({
    collegeName: req.body.collegeName,
    description: req.body.description,
    location: req.body.location,
    foundedYear: req.body.foundedYear,
    programs: req.body.programs,
    campusLife: req.body.campusLife,
    contactEmail: req.body.contactEmail,
    contactPhone: req.body.contactPhone,
    website: req.body.website
  });

  try {
    const newCollege = await college.save();
    res.status(201).json(newCollege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a college
router.put('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    Object.keys(req.body).forEach(key => {
      college[key] = req.body[key];
    });

    const updatedCollege = await college.save();
    res.json(updatedCollege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a college
router.delete('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    await college.deleteOne();
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 