const express = require('express');
const { body, validationResult } = require('express-validator');
const TransportVendor = require('../models/TransportVendor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List transport vendors
router.get('/', protect, async (req, res) => {
  try {
    const vendors = await TransportVendor.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: vendors } });
  } catch (e) {
    console.error('List transport vendors error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create transport vendor
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const vendor = await TransportVendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (e) {
    console.error('Create transport vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update transport vendor
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await TransportVendor.update(req.body, { where: { id: req.params.id } });
    const vendor = await TransportVendor.findByPk(req.params.id);
    res.json({ success: true, data: vendor });
  } catch (e) {
    console.error('Update transport vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete transport vendor
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await TransportVendor.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete transport vendor error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
