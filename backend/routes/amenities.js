const express = require('express');
const { body, validationResult } = require('express-validator');
const Amenity = require('../models/Amenity');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List amenities
router.get('/', protect, async (req, res) => {
  try {
    const items = await Amenity.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items } });
  } catch (e) {
    console.error('List amenities error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create amenity
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const amenity = await Amenity.create(req.body);
    res.status(201).json({ success: true, data: amenity });
  } catch (e) {
    console.error('Create amenity error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update amenity
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Amenity.update(req.body, { where: { id: req.params.id } });
    const amenity = await Amenity.findByPk(req.params.id);
    res.json({ success: true, data: amenity });
  } catch (e) {
    console.error('Update amenity error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete amenity
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Amenity.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete amenity error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


