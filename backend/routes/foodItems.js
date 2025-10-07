const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodItem = require('../models/FoodItem');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List food items
router.get('/', protect, async (req, res) => {
  try {
    const items = await FoodItem.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: items } });
  } catch (e) {
    console.error('List food items error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create food item
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty(),
  body('food_category_id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const item = await FoodItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    console.error('Create food item error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update food item
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodItem.update(req.body, { where: { id: req.params.id } });
    const item = await FoodItem.findByPk(req.params.id);
    res.json({ success: true, data: item });
  } catch (e) {
    console.error('Update food item error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete food item
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodItem.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete food item error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
