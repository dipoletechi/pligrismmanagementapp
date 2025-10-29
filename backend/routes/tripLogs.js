const express = require('express');
const router = express.Router();
const { TripLog, User, Trip, TransportVendor, AccommodationVendor, FoodVendor } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Helper function to process logs with vendor information
const processLogsWithVendorInfo = async (logs) => {
  return Promise.all(logs.map(async (log) => {
    const logData = log.toJSON();
    
    // Add vendor information based on log type
    if (log.log_type.includes('Transport')) {
      try {
        const vendorId = parseInt(log.log_item_id);
        const vendor = await TransportVendor.findByPk(vendorId);
        logData.vendor_info = vendor ? {
          id: vendor.id,
          name: vendor.title,
          type: 'Transport'
        } : null;
      } catch (error) {
        console.error('Error fetching transport vendor:', error);
        logData.vendor_info = null;
      }
    } else if (log.log_type.includes('Accommodation')) {
      try {
        const vendorId = parseInt(log.log_item_id);
        const vendor = await AccommodationVendor.findByPk(vendorId);
        logData.vendor_info = vendor ? {
          id: vendor.id,
          name: vendor.title,
          type: 'Accommodation'
        } : null;
      } catch (error) {
        console.error('Error fetching accommodation vendor:', error);
        logData.vendor_info = null;
      }
    } else if (log.log_type.includes('Event')) {
      // For events, log_item_id contains the event title
      logData.vendor_info = {
        id: log.log_item_id,
        name: log.log_item_id,
        type: 'Event'
      };
    } else {
      logData.vendor_info = null;
    }
    
    return logData;
  }));
};

// Create a new trip log entry
router.post('/',
  protect,
  [
    body('trip_id').isInt().withMessage('Trip ID must be a valid integer'),
    body('user_id').isInt().withMessage('User ID must be a valid integer'),
    body('log_type').isIn([
      'TransportCheckIn', 'TransportCheckOut',
      'AccommodationCheckIn', 'AccommodationCheckOut',
      'EventCheckIn', 'EventCheckOut'
    ]).withMessage('Invalid log type'),
    body('log_item_id').notEmpty().withMessage('Log item ID is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { trip_id, log_type, log_item_id, user_id } = req.body;

      // Verify trip exists and user has access
      const trip = await Trip.findByPk(trip_id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Create trip log entry
      const tripLog = await TripLog.create({
        user_id: user_id, // Use the user ID from QR code, not scanner's ID
        trip_id,
        log_type,
        log_item_id,
        scanned_at: new Date()
      });

      // Fetch the created log with associations
      const createdLog = await TripLog.findByPk(tripLog.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'start_date', 'end_date']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Trip log created successfully',
        data: createdLog
      });

    } catch (error) {
      console.error('Error creating trip log:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// Get trip logs for a specific trip
router.get('/trip/:tripId',
  protect,
  async (req, res) => {
    try {
      const { tripId } = req.params;
      const user_id = req.user.id;

      // Verify trip exists and user has access
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Get trip logs for the trip
      const tripLogs = await TripLog.findAll({
        where: {
          trip_id: tripId,
          user_id: user_id
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'start_date', 'end_date']
          }
        ],
        order: [['scanned_at', 'DESC']]
      });

      res.json({
        success: true,
        data: tripLogs
      });

    } catch (error) {
      console.error('Error fetching trip logs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// Get trip logs for a specific user and trip (for admin viewing applicant details)
router.get('/user/:userId/trip/:tripId',
  protect,
  async (req, res) => {
    try {
      const { userId, tripId } = req.params;
      
      // Check if user has admin privileges or is accessing their own logs
      const hasAdminRole = ['admin', 'trip_manager', 'superadmin', 'financial_manager'].includes(req.user.role);
      const isOwnLogs = req.user.id == userId;
      
      if (!hasAdminRole && !isOwnLogs) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own logs or need admin privileges.'
        });
      }

      // Verify trip exists
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Verify user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get trip logs for the specific user and trip
      const tripLogs = await TripLog.findAll({
        where: {
          trip_id: tripId,
          user_id: userId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'start_date', 'end_date']
          }
        ],
        order: [['scanned_at', 'DESC']]
      });

      // Process logs to include vendor information
      const processedLogs = await processLogsWithVendorInfo(tripLogs);

      res.json({
        success: true,
        data: processedLogs
      });

    } catch (error) {
      console.error('Error fetching user trip logs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// Get all trip logs for a user
router.get('/user',
  protect,
  async (req, res) => {
    try {
      const user_id = req.user.id;

      const tripLogs = await TripLog.findAll({
        where: { user_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Trip,
            as: 'trip',
            attributes: ['id', 'title', 'start_date', 'end_date']
          }
        ],
        order: [['scanned_at', 'DESC']]
      });

      res.json({
        success: true,
        data: tripLogs
      });

    } catch (error) {
      console.error('Error fetching user trip logs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

module.exports = router;
