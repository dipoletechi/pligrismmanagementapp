const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List events for a trip
router.get('/trip/:tripId', protect, async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { trip_id: req.params.tripId },
      order: [['start_time', 'ASC']]
    });
    res.json({ success: true, data: { items: events } });
  } catch (e) {
    console.error('List events error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create event
router.post('/', protect, authorize('superadmin', 'admin', 'trip_manager'), [
  body('trip_id').isInt().withMessage('Trip ID must be a valid integer'),
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('start_time').isISO8601().withMessage('Start time must be a valid date'),
  body('end_time').isISO8601().withMessage('End time must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { trip_id, title, description, start_time, end_time } = req.body;

    // Validate that end time is after start time
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const event = await Event.create({
      trip_id,
      title,
      description: description || null,
      start_time: new Date(start_time),
      end_time: new Date(end_time)
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { item: event }
    });
  } catch (e) {
    console.error('Create event error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update event
router.put('/:id', protect, authorize('superadmin', 'admin', 'trip_manager'), [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('start_time').optional().isISO8601().withMessage('Start time must be a valid date'),
  body('end_time').optional().isISO8601().withMessage('End time must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, start_time, end_time } = req.body;

    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Validate that end time is after start time if both are provided
    if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Update event
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (start_time) event.start_time = new Date(start_time);
    if (end_time) event.end_time = new Date(end_time);

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { item: event }
    });
  } catch (e) {
    console.error('Update event error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', protect, authorize('superadmin', 'admin', 'trip_manager'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (e) {
    console.error('Delete event error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

