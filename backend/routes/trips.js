const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List trips
router.get('/', protect, async (req, res) => {
  try {
    const trips = await Trip.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: trips } });
  } catch (e) {
    console.error('List trips error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single trip
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, data: trip });
  } catch (e) {
    console.error('Get trip error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create trip
router.post('/', protect, authorize('superadmin', 'admin', 'trip_manager'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  
  try {
    const tripData = { ...req.body, created_by: req.user.id };
    const trip = await Trip.create(tripData);
    res.status(201).json({ success: true, data: trip });
  } catch (e) {
    console.error('Create trip error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update trip
router.put('/:id', protect, authorize('superadmin', 'admin', 'trip_manager'), async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    await Trip.update(req.body, { where: { id: req.params.id } });
    const updatedTrip = await Trip.findByPk(req.params.id);
    res.json({ success: true, data: updatedTrip });
  } catch (e) {
    console.error('Update trip error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete trip
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    await Trip.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (e) {
    console.error('Delete trip error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
