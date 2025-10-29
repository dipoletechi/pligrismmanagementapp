const express = require('express');
const router = express.Router();
const { VendorFeedback, TripFeedback, User, Trip } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// Get all feedbacks
router.get('/',
  protect,
  async (req, res) => {
    try {
      console.log('Feedback API - User:', req.user);
      console.log('Feedback API - User role:', req.user?.role);
      
      // Get vendor feedbacks
      console.log('Fetching vendor feedbacks...');
      const vendorFeedbacks = await VendorFeedback.findAll();
      console.log('Vendor feedbacks found:', vendorFeedbacks.length);

      // Get trip feedbacks
      console.log('Fetching trip feedbacks...');
      const tripFeedbacks = await TripFeedback.findAll();
      console.log('Trip feedbacks found:', tripFeedbacks.length);

      // Get user and trip data separately for trip feedbacks
      const tripFeedbacksWithDetails = await Promise.all(
        tripFeedbacks.map(async (feedback) => {
          try {
            const user = await User.findByPk(feedback.user_id);
            const trip = await Trip.findByPk(feedback.trip_id);
            return {
              ...feedback.toJSON(),
              user: user ? {
                id: user.id,
                firstName: user.firstName || user.first_name || 'Unknown',
                lastName: user.lastName || user.last_name || '',
                email: user.email || 'Unknown'
              } : null,
              trip: trip ? {
                id: trip.id,
                title: trip.title || 'Unknown Trip'
              } : null
            };
          } catch (error) {
            console.error('Error fetching details for trip feedback:', error);
            return {
              ...feedback.toJSON(),
              user: null,
              trip: null
            };
          }
        })
      );

      // Get user and trip data separately for vendor feedbacks
      const vendorFeedbacksWithDetails = await Promise.all(
        vendorFeedbacks.map(async (feedback) => {
          try {
            const user = await User.findByPk(feedback.userId);
            const trip = await Trip.findByPk(feedback.tripid);
            return {
              ...feedback.toJSON(),
              user: user ? {
                id: user.id,
                firstName: user.firstName || user.first_name || 'Unknown',
                lastName: user.lastName || user.last_name || '',
                email: user.email || 'Unknown'
              } : null,
              trip: trip ? {
                id: trip.id,
                title: trip.title || 'Unknown Trip'
              } : null
            };
          } catch (error) {
            console.error('Error fetching details for vendor feedback:', error);
            return {
              ...feedback.toJSON(),
              user: null,
              trip: null
            };
          }
        })
      );

      // Combine and sort feedbacks
      const allFeedbacks = [
        ...vendorFeedbacksWithDetails.map(f => ({ ...f, type: 'vendor' })),
        ...tripFeedbacksWithDetails.map(f => ({ ...f, type: 'trip' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

      console.log('Total feedbacks:', allFeedbacks.length);

      res.json({
        success: true,
        data: allFeedbacks
      });

    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// Get feedback by ID
router.get('/:id',
  protect,
  authorize(['superadmin', 'admin', 'trip_manager', 'transport']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.query; // 'vendor' or 'trip'

      let feedback;
      if (type === 'vendor') {
        feedback = await VendorFeedback.findByPk(id, {
          include: [
            { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
            { model: Trip, as: 'trip', attributes: ['id', 'title'] }
          ]
        });
        if (feedback) feedback = { ...feedback.toJSON(), type: 'vendor' };
      } else {
        feedback = await TripFeedback.findByPk(id, {
          include: [
            { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
            { model: Trip, as: 'trip', attributes: ['id', 'title'] }
          ]
        });
        if (feedback) feedback = { ...feedback.toJSON(), type: 'trip' };
      }

      if (!feedback) {
        return res.status(404).json({ success: false, message: 'Feedback not found' });
      }

      res.json({ success: true, data: feedback });

    } catch (error) {
      console.error('Error fetching single feedback:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }
);

// Create Vendor Feedback
router.post('/vendor',
  protect,
  authorize(['user']), // Typically users submit feedback
  async (req, res) => {
    try {
      const { tripid, ratings, vendor_type, transport_vendor_id, accommodation_vendor_id, food_vendor_id, comment } = req.body;
      const userId = req.user.id; // Assuming user ID is from authenticated user

      const newFeedback = await VendorFeedback.create({
        tripid,
        userId,
        ratings,
        vendor_type,
        transport_vendor_id,
        accommodation_vendor_id,
        food_vendor_id,
        comment
      });

      res.status(201).json({
        success: true,
        message: 'Vendor feedback submitted successfully',
        data: newFeedback
      });

    } catch (error) {
      console.error('Error submitting vendor feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// Create Trip Feedback
router.post('/trip',
  protect,
  authorize(['user']), // Typically users submit feedback
  async (req, res) => {
    try {
      const { tripid, ratings, comment } = req.body;
      const userId = req.user.id; // Assuming user ID is from authenticated user

      const newFeedback = await TripFeedback.create({
        tripid,
        userId,
        ratings,
        comment
      });

      res.status(201).json({
        success: true,
        message: 'Trip feedback submitted successfully',
        data: newFeedback
      });

    } catch (error) {
      console.error('Error submitting trip feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

module.exports = router;
