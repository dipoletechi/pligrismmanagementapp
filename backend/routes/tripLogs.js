const express = require('express');
const router = express.Router();
const { TripLog, User, Trip } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create a new trip log entry
router.post('/',
  protect,
  [
    body('trip_id').isInt().withMessage('Trip ID must be a valid integer'),
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

      const { trip_id, log_type, log_item_id } = req.body;
      const user_id = req.user.id;

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
        user_id,
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
            attributes: ['id', 'name', 'email']
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
            attributes: ['id', 'name', 'email']
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
            attributes: ['id', 'name', 'email']
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
