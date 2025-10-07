const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodVendor = require('../models/FoodVendor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List food vendors
router.get('/', protect, async (req, res) => {
  try {
    const vendors = await FoodVendor.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: vendors } });
  } catch (e) {
    console.error('List food vendors error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create food vendor
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const vendor = await FoodVendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (e) {
    console.error('Create food vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update food vendor
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodVendor.update(req.body, { where: { id: req.params.id } });
    const vendor = await FoodVendor.findByPk(req.params.id);
    res.json({ success: true, data: vendor });
  } catch (e) {
    console.error('Update food vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete food vendor
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodVendor.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete food vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
