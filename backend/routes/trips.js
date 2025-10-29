const express = require('express');
const { body, validationResult } = require('express-validator');
const { Trip, TripStatus, Destination } = require('../models');
const TripVendorAllocation = require('../models/TripVendorAllocation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List trips
router.get('/', protect, async (req, res) => {
  try {
    const trips = await Trip.findAll({ 
      include: [
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['id', 'title', 'latitude', 'longitude', 'address']
        }
      ],
      order: [['created_at', 'DESC']] 
    });
    res.json({ success: true, data: { items: trips } });
  } catch (e) {
    console.error('List trips error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single trip
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['id', 'title', 'latitude', 'longitude', 'address']
        }
      ]
    });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    // Fetch vendor allocations from trip_vendor_allocations table
    const vendorAllocations = await TripVendorAllocation.findAll({
      where: { trip_id: req.params.id }
    });
    
    // Reconstruct finance_data from vendor allocations
    const financeData = {
      vendors: vendorAllocations.map(allocation => ({
        vendorId: allocation.vendor_id,
        type: allocation.vendor_type,
        amount: parseFloat(allocation.amount),
        description: allocation.description || '',
        notes: allocation.notes || ''
      }))
    };
    
    // Override finance_data with reconstructed data
    const tripData = trip.toJSON();
    tripData.finance_data = financeData;
    
    res.json({ success: true, data: tripData });
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
    
    // Save vendor allocations to trip_vendor_allocations table
    if (req.body.finance_data) {
      try {
        const financeData = typeof req.body.finance_data === 'string' 
          ? JSON.parse(req.body.finance_data) 
          : req.body.finance_data;
        
        // Save vendor allocations
        if (financeData.vendors && Array.isArray(financeData.vendors)) {
          const vendorAllocations = financeData.vendors.map(vendor => ({
            trip_id: trip.id,
            vendor_type: vendor.type,
            vendor_id: vendor.vendorId,
            amount: vendor.amount || 0,
            description: vendor.description || null,
            status: 'pending'
          }));
          
          if (vendorAllocations.length > 0) {
            await TripVendorAllocation.bulkCreate(vendorAllocations);
          }
        }
      } catch (financeError) {
        console.error('Error saving vendor allocations:', financeError);
        // Don't fail the trip creation, just log the error
      }
    }
    
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
    
    // Update vendor allocations in trip_vendor_allocations table
    // Only update if finance_data is explicitly provided
    if (req.body.finance_data !== undefined) {
      try {
        const financeData = typeof req.body.finance_data === 'string' 
          ? JSON.parse(req.body.finance_data) 
          : req.body.finance_data;
        
        if (financeData.vendors && Array.isArray(financeData.vendors) && financeData.vendors.length > 0) {
          // Get existing vendor allocations
          const existingAllocations = await TripVendorAllocation.findAll({ 
            where: { trip_id: req.params.id } 
          });
          
          const existingMap = new Map();
          existingAllocations.forEach(allocation => {
            const key = `${allocation.vendor_type}_${allocation.vendor_id}`;
            existingMap.set(key, allocation);
          });
          
          const newVendorKeys = new Set();
          
          // Update or create vendor allocations
          for (const vendor of financeData.vendors) {
            const key = `${vendor.type}_${vendor.vendorId}`;
            newVendorKeys.add(key);
            
            const existingAllocation = existingMap.get(key);
            
            if (existingAllocation) {
              // Update existing allocation
              await existingAllocation.update({
                amount: vendor.amount || 0,
                description: vendor.description || null
              });
            } else {
              // Create new allocation
              await TripVendorAllocation.create({
                trip_id: req.params.id,
                vendor_type: vendor.type,
                vendor_id: vendor.vendorId,
                amount: vendor.amount || 0,
                description: vendor.description || null,
                status: 'pending'
              });
            }
          }
          
          // Delete allocations that are no longer present
          for (const [key, allocation] of existingMap.entries()) {
            if (!newVendorKeys.has(key)) {
              await allocation.destroy();
            }
          }
        }
        // If no vendors provided, keep existing allocations (don't delete)
      } catch (financeError) {
        console.error('Error updating vendor allocations:', financeError);
        // Don't fail the trip update, just log the error
      }
    }
    
    const updatedTrip = await Trip.findByPk(req.params.id);
    res.json({ success: true, data: updatedTrip });
  } catch (e) {
    console.error('Update trip error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update trip status
router.patch('/:id/status', protect, authorize('superadmin', 'admin'), [
  body('trip_status_id').isInt().withMessage('Valid status ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  try {
    const { trip_status_id } = req.body;
    
    // Verify the status exists
    const status = await TripStatus.findByPk(trip_status_id);
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status ID' 
      });
    }

    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    await trip.update({ trip_status_id });
    
    // Return updated trip with status
    const updatedTrip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['id', 'title', 'latitude', 'longitude', 'address']
        }
      ]
    });
    
    res.json({ 
      success: true, 
      message: 'Trip status updated successfully',
      data: updatedTrip 
    });
  } catch (e) {
    console.error('Update trip status error:', e);
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
