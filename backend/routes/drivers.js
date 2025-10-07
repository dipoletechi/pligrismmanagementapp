const express = require('express');
const { body, validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List drivers
router.get('/', protect, async (req, res) => {
  try {
    const drivers = await Driver.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: drivers } });
  } catch (e) {
    console.error('List drivers error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create driver
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (e) {
    console.error('Create driver error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update driver
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Driver.update(req.body, { where: { id: req.params.id } });
    const driver = await Driver.findByPk(req.params.id);
    res.json({ success: true, data: driver });
  } catch (e) {
    console.error('Update driver error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete driver
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Driver.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete driver error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
