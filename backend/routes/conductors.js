const express = require('express');
const { body, validationResult } = require('express-validator');
const Conductor = require('../models/Conductor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List conductors
router.get('/', protect, async (req, res) => {
  try {
    const conductors = await Conductor.findAll({ 
      order: [['created_at', 'DESC']],
      attributes: ['id', 'first_name', 'last_name', 'phone_number', 'transport_vendor_id', 'created_at', 'updated_at']
    });
    res.json({ success: true, data: { items: conductors } });
  } catch (e) {
    console.error('List conductors error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create conductor
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('last_name').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone_number').optional().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { first_name, last_name, phone_number, transport_vendor_id } = req.body;

    const conductor = await Conductor.create({
      first_name,
      last_name,
      phone_number,
      transport_vendor_id
    });

    res.status(201).json({
      success: true,
      message: 'Conductor created successfully',
      data: { conductor }
    });
  } catch (error) {
    console.error('Create conductor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get conductor by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const conductor = await Conductor.findByPk(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'phone_number', 'transport_vendor_id', 'created_at', 'updated_at']
    });

    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor not found'
      });
    }

    res.json({
      success: true,
      data: { conductor }
    });
  } catch (error) {
    console.error('Get conductor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update conductor
router.put('/:id', protect, authorize('superadmin', 'admin'), [
  body('first_name').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('last_name').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone_number').optional().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { first_name, last_name, phone_number, transport_vendor_id } = req.body;

    const conductor = await Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor not found'
      });
    }

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (transport_vendor_id !== undefined) updateData.transport_vendor_id = transport_vendor_id;

    await Conductor.update(updateData, {
      where: { id: req.params.id }
    });

    const updatedConductor = await Conductor.findByPk(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'phone_number', 'transport_vendor_id', 'created_at', 'updated_at']
    });

    res.json({
      success: true,
      message: 'Conductor updated successfully',
      data: { conductor: updatedConductor }
    });
  } catch (error) {
    console.error('Update conductor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete conductor
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const conductor = await Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor not found'
      });
    }

    await Conductor.destroy({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Conductor deleted successfully'
    });
  } catch (error) {
    console.error('Delete conductor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
