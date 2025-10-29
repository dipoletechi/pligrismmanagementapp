const express = require('express');
const { body, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List buses
router.get('/', protect, async (req, res) => {
  try {
    const buses = await Bus.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: buses } });
  } catch (e) {
    console.error('List buses error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create bus
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (e) {
    console.error('Create bus error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update bus
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Bus.update(req.body, { where: { id: req.params.id } });
    const bus = await Bus.findByPk(req.params.id);
    res.json({ success: true, data: bus });
  } catch (e) {
    console.error('Update bus error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete bus
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Bus.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete bus error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
