const express = require('express');
const { body, validationResult } = require('express-validator');
const AccommodationVendor = require('../models/AccommodationVendor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List accommodation vendors
router.get('/', protect, async (req, res) => {
  try {
    const vendors = await AccommodationVendor.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: vendors } });
  } catch (e) {
    console.error('List accommodation vendors error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create accommodation vendor
router.post('/', protect, authorize('superadmin', 'admin', 'financial_manager'), [
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const vendor = await AccommodationVendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (e) {
    console.error('Create accommodation vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update accommodation vendor
router.put('/:id', protect, authorize('superadmin', 'admin', 'financial_manager'), async (req, res) => {
  try {
    await AccommodationVendor.update(req.body, { where: { id: req.params.id } });
    const vendor = await AccommodationVendor.findByPk(req.params.id);
    res.json({ success: true, data: vendor });
  } catch (e) {
    console.error('Update accommodation vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete accommodation vendor
router.delete('/:id', protect, authorize('superadmin', 'admin', 'financial_manager'), async (req, res) => {
  try {
    await AccommodationVendor.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete accommodation vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
