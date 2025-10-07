const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodSchedule = require('../models/FoodSchedule');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List food schedules
router.get('/', protect, async (req, res) => {
  try {
    const schedules = await FoodSchedule.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: schedules } });
  } catch (e) {
    console.error('List food schedules error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create food schedule
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty(),
  body('start_time').notEmpty(),
  body('end_time').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const schedule = await FoodSchedule.create(req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (e) {
    console.error('Create food schedule error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update food schedule
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodSchedule.update(req.body, { where: { id: req.params.id } });
    const schedule = await FoodSchedule.findByPk(req.params.id);
    res.json({ success: true, data: schedule });
  } catch (e) {
    console.error('Update food schedule error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete food schedule
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await FoodSchedule.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete food schedule error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
