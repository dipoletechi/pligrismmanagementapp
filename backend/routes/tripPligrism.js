const express = require('express');
const router = express.Router();
const { TripPligrism, Trip, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Get all trip applications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const applications = await TripPligrism.findAll({
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [
            {
              model: require('../models').Destination,
              as: 'destinationInfo'
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching trip applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip applications',
      error: error.message
    });
  }
});

// Get trip applications by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const applications = await TripPligrism.findAll({
      where: { userid: userId },
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [
            {
              model: require('../models').Destination,
              as: 'destinationInfo'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching user trip applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user trip applications',
      error: error.message
    });
  }
});

// Get trip applications by trip
router.get('/trip/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const applications = await TripPligrism.findAll({
      where: { tripid: tripId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching trip applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip applications',
      error: error.message
    });
  }
});

// Create new trip application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripid, userid, status = 'Pending' } = req.body;

    // Check if application already exists
    const existingApplication = await TripPligrism.findOne({
      where: { tripid, userid }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Application already exists for this trip'
      });
    }

    // Verify trip exists
    const trip = await Trip.findByPk(tripid);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Verify user exists
    const user = await User.findByPk(userid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const application = await TripPligrism.create({
      tripid,
      userid,
      status
    });

    // Fetch the created application with associations
    const createdApplication = await TripPligrism.findByPk(application.id, {
      include: [
        {
          model: Trip,
          as: 'trip'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Trip application created successfully',
      data: createdApplication
    });
  } catch (error) {
    console.error('Error creating trip application:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip application',
      error: error.message
    });
  }
});

// Update trip application status
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Approved, or Reject'
      });
    }

    const application = await TripPligrism.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Trip application not found'
      });
    }

    await application.update({ status });

    // Fetch updated application with associations
    const updatedApplication = await TripPligrism.findByPk(id, {
      include: [
        {
          model: Trip,
          as: 'trip'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Trip application status updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating trip application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip application',
      error: error.message
    });
  }
});

// Delete trip application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const application = await TripPligrism.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Trip application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Trip application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trip application',
      error: error.message
    });
  }
});

// Get application statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalApplications = await TripPligrism.count();
    const pendingApplications = await TripPligrism.count({ where: { status: 'Pending' } });
    const approvedApplications = await TripPligrism.count({ where: { status: 'Approved' } });
    const rejectedApplications = await TripPligrism.count({ where: { status: 'Reject' } });

    res.json({
      success: true,
      data: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications
      }
    });
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
});

module.exports = router;
