const express = require('express');
const router = express.Router();
const Codex = require('../models/Codex');

// Get all codex entries
router.get('/', async (req, res) => {
  try {
    const codexes = await Codex.find().sort({ createdAt: -1 });
    res.json(codexes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single codex entry
router.get('/:id', async (req, res) => {
  try {
    const codex = await Codex.findById(req.params.id);
    if (!codex) {
      return res.status(404).json({ message: 'Codex not found' });
    }
    res.json(codex);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create codex entry
router.post('/', async (req, res) => {
  const codex = new Codex({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags
  });

  try {
    const newCodex = await codex.save();
    res.status(201).json(newCodex);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update codex entry
router.put('/:id', async (req, res) => {
  try {
    const codex = await Codex.findById(req.params.id);
    if (!codex) {
      return res.status(404).json({ message: 'Codex not found' });
    }

    Object.assign(codex, req.body);
    const updatedCodex = await codex.save();
    res.json(updatedCodex);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete codex entry
router.delete('/:id', async (req, res) => {
  try {
    const codex = await Codex.findById(req.params.id);
    if (!codex) {
      return res.status(404).json({ message: 'Codex not found' });
    }

    await codex.deleteOne();
    res.json({ message: 'Codex deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 