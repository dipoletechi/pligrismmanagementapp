const express = require('express');
const router = express.Router();
const { TripPligrim, User, Trip } = require('../models');

// Get all users with role 'user' (pilgrims)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'aadhaar_number', 'aadhaar_address', 'accountStatus', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });

    // Map user account status to display status
    const pilgrims = users.map(user => {
      return {
        id: user.id,
        user: user,
        status: user.accountStatus || 'pending', // Use the actual accountStatus from database
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    });

    res.json({
      success: true,
      data: pilgrims
    });
  } catch (error) {
    console.error('Error fetching pilgrims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pilgrims',
      error: error.message
    });
  }
});

// Get pilgrim applications by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const applications = await TripPligrim.findAll({
      where: { userid: userId },
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'user' },
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'aadhaar_number', 'aadhaar_address']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching user pilgrim applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user pilgrim applications',
      error: error.message
    });
  }
});

// Get pilgrim applications by trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const applications = await TripPligrim.findAll({
      where: { tripid: tripId },
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'user' },
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'aadhaar_number', 'aadhaar_address']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching trip pilgrim applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip pilgrim applications',
      error: error.message
    });
  }
});

// Get pilgrim application statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await TripPligrim.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      const count = parseInt(stat.dataValues.count);
      formattedStats.total += count;
      
      switch (stat.status) {
        case 'Pending':
          formattedStats.pending = count;
          break;
        case 'Approved':
          formattedStats.approved = count;
          break;
        case 'Reject':
          formattedStats.rejected = count;
          break;
      }
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching pilgrim statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pilgrim statistics',
      error: error.message
    });
  }
});

// Create new pilgrim application
router.post('/', async (req, res) => {
  try {
    const { tripid, userid, status = 'Pending' } = req.body;

    // Check if application already exists
    const existingApplication = await TripPligrim.findOne({
      where: { tripid, userid }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Application already exists for this user and trip'
      });
    }

    const application = await TripPligrim.create({
      tripid,
      userid,
      status
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Pilgrim application created successfully'
    });
  } catch (error) {
    console.error('Error creating pilgrim application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pilgrim application',
      error: error.message
    });
  }
});

// Update pilgrim application
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await TripPligrim.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Pilgrim application not found'
      });
    }

    await application.update({ status });

    res.json({
      success: true,
      data: application,
      message: 'Pilgrim application updated successfully'
    });
  } catch (error) {
    console.error('Error updating pilgrim application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pilgrim application',
      error: error.message
    });
  }
});

// Delete pilgrim application
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const application = await TripPligrim.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Pilgrim application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Pilgrim application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pilgrim application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pilgrim application',
      error: error.message
    });
  }
});

module.exports = router;