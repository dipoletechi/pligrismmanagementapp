const express = require('express');
const router = express.Router();
const { TripStatus } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// Get all trip statuses
router.get('/', protect, async (req, res) => {
  try {
    const statuses = await TripStatus.findAll({
      where: { is_active: true },
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        items: statuses,
        total: statuses.length
      }
    });
  } catch (error) {
    console.error('Error fetching trip statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip statuses',
      error: error.message
    });
  }
});

// Get trip status by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const status = await TripStatus.findByPk(id);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Trip status not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching trip status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip status',
      error: error.message
    });
  }
});

// Create new trip status (Admin only)
router.post('/', protect, authorize(['superadmin', 'admin']), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Status name is required'
      });
    }

    const status = await TripStatus.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Trip status created successfully',
      data: status
    });
  } catch (error) {
    console.error('Error creating trip status:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip status',
      error: error.message
    });
  }
});

// Update trip status (Admin only)
router.put('/:id', protect, authorize(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const status = await TripStatus.findByPk(id);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Trip status not found'
      });
    }

    await status.update({
      name: name || status.name,
      description: description !== undefined ? description : status.description,
      is_active: is_active !== undefined ? is_active : status.is_active
    });

    res.json({
      success: true,
      message: 'Trip status updated successfully',
      data: status
    });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip status',
      error: error.message
    });
  }
});

// Delete trip status (Admin only)
router.delete('/:id', protect, authorize(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const status = await TripStatus.findByPk(id);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Trip status not found'
      });
    }

    // Soft delete by setting is_active to false
    await status.update({ is_active: false });

    res.json({
      success: true,
      message: 'Trip status deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip status:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trip status',
      error: error.message
    });
  }
});

module.exports = router;
