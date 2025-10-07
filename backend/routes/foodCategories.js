const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodCategory = require('../models/FoodCategory');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List food categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await FoodCategory.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: categories } });
  } catch (e) {
    console.error('List food categories error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create food category
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const category = await FoodCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (e) {
    console.error('Create food category error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update food category
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodCategory.update(req.body, { where: { id: req.params.id } });
    const category = await FoodCategory.findByPk(req.params.id);
    res.json({ success: true, data: category });
  } catch (e) {
    console.error('Update food category error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete food category
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodCategory.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete food category error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
