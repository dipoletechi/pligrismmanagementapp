const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const TripVendorAllocation = require('../models/TripVendorAllocation');
const { Trip, AccommodationVendor, FoodVendor, TransportVendor } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Parser } = require('json2csv');

// Get all reports with filters
router.get('/',
  protect,
  async (req, res) => {
    try {
      const {
        trip_ids,
        vendor_type,
        vendor_id,
        start_date,
        end_date,
        amount_min,
        amount_max,
        status
      } = req.query;

      // Build where clause dynamically
      const whereClause = {};

      // Handle multiple trip IDs (comma-separated)
      if (trip_ids) {
        const tripIdsArray = trip_ids.split(',').map(id => parseInt(id.trim()));
        console.log('🔍 Backend: trip_ids received:', trip_ids);
        console.log('🔍 Backend: tripIdsArray:', tripIdsArray);
        whereClause.trip_id = { [Op.in]: tripIdsArray };
      }
      if (vendor_type) whereClause.vendor_type = vendor_type;
      if (vendor_id) whereClause.vendor_id = vendor_id;
      if (status) whereClause.status = status;

      // Amount range filter
      if (amount_min || amount_max) {
        whereClause.amount = {};
        if (amount_min) whereClause.amount[Op.gte] = parseFloat(amount_min);
        if (amount_max) whereClause.amount[Op.lte] = parseFloat(amount_max);
      }

      // Date range filter
      if (start_date || end_date) {
        whereClause.created_at = {};
        if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
        if (end_date) whereClause.created_at[Op.lte] = new Date(end_date);
      }

      console.log('🔍 Backend: Final whereClause:', JSON.stringify(whereClause, null, 2));

      // Fetch trip vendor allocations
      const vendorAllocations = await TripVendorAllocation.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      console.log('✅ Backend: Found allocations:', vendorAllocations.length);
      if (vendorAllocations.length > 0) {
        console.log('✅ Backend: Sample allocation trip_id:', vendorAllocations[0].trip_id);
      }

      // Fetch related data
      const reportsWithDetails = await Promise.all(
        vendorAllocations.map(async (allocation) => {
          try {
            // Get trip details
            const trip = await Trip.findByPk(allocation.trip_id);

            // Get vendor details based on type
            let vendor = null;
            if (allocation.vendor_type === 'accommodation') {
              vendor = await AccommodationVendor.findByPk(allocation.vendor_id);
            } else if (allocation.vendor_type === 'food') {
              vendor = await FoodVendor.findByPk(allocation.vendor_id);
            } else if (allocation.vendor_type === 'transport') {
              vendor = await TransportVendor.findByPk(allocation.vendor_id);
            }

            return {
              id: allocation.id,
              trip_id: allocation.trip_id,
              trip_title: trip ? trip.title : 'Unknown Trip',
              trip_start_date: trip ? trip.start_date : null,
              trip_end_date: trip ? trip.end_date : null,
              vendor_id: allocation.vendor_id,
              vendor_title: vendor ? vendor.title : 'Unknown Vendor',
              vendor_type: allocation.vendor_type,
              amount: parseFloat(allocation.amount),
              status: allocation.status,
              description: allocation.description || '',
              payment_date: allocation.payment_date || null,
              created_at: allocation.created_at,
              updated_at: allocation.updated_at
            };
          } catch (error) {
            console.error('Error fetching report details:', error);
            return {
              id: allocation.id,
              trip_id: allocation.trip_id,
              trip_title: 'Unknown Trip',
              trip_start_date: null,
              trip_end_date: null,
              vendor_id: allocation.vendor_id,
              vendor_title: 'Unknown Vendor',
              vendor_type: allocation.vendor_type,
              amount: parseFloat(allocation.amount),
              status: allocation.status,
              description: allocation.description || '',
              payment_date: allocation.payment_date || null,
              created_at: allocation.created_at,
              updated_at: allocation.updated_at
            };
          }
        })
      );

      res.json({
        success: true,
        data: reportsWithDetails,
        count: reportsWithDetails.length
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
);

// Export reports as CSV
router.get('/export/csv',
  protect,
  async (req, res) => {
    try {
      const {
        trip_ids,
        vendor_type,
        vendor_id,
        start_date,
        end_date,
        amount_min,
        amount_max,
        status
      } = req.query;

      // Build where clause (same as above)
      const whereClause = {};
      
      // Handle multiple trip IDs (comma-separated)
      if (trip_ids) {
        const tripIdsArray = trip_ids.split(',').map(id => parseInt(id.trim()));
        whereClause.trip_id = { [Op.in]: tripIdsArray };
      }
      if (vendor_type) whereClause.vendor_type = vendor_type;
      if (vendor_id) whereClause.vendor_id = vendor_id;
      if (status) whereClause.status = status;

      if (amount_min || amount_max) {
        whereClause.amount = {};
        if (amount_min) whereClause.amount[Op.gte] = parseFloat(amount_min);
        if (amount_max) whereClause.amount[Op.lte] = parseFloat(amount_max);
      }

      if (start_date || end_date) {
        whereClause.created_at = {};
        if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
        if (end_date) whereClause.created_at[Op.lte] = new Date(end_date);
      }

      const vendorAllocations = await TripVendorAllocation.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      const reportsWithDetails = await Promise.all(
        vendorAllocations.map(async (allocation) => {
          const trip = await Trip.findByPk(allocation.trip_id);
          let vendor = null;
          
          if (allocation.vendor_type === 'accommodation') {
            vendor = await AccommodationVendor.findByPk(allocation.vendor_id);
          } else if (allocation.vendor_type === 'food') {
            vendor = await FoodVendor.findByPk(allocation.vendor_id);
          } else if (allocation.vendor_type === 'transport') {
            vendor = await TransportVendor.findByPk(allocation.vendor_id);
          }

          return {
            'Trip Title': trip ? trip.title : 'Unknown',
            'Trip Start Date': trip ? new Date(trip.start_date).toLocaleDateString() : 'N/A',
            'Trip End Date': trip ? new Date(trip.end_date).toLocaleDateString() : 'N/A',
            'Vendor Title': vendor ? vendor.title : 'Unknown',
            'Vendor Type': allocation.vendor_type,
            'Amount': parseFloat(allocation.amount),
            'Status': allocation.status,
            'Description': allocation.description || '',
            'Payment Date': allocation.payment_date ? new Date(allocation.payment_date).toLocaleDateString() : 'N/A',
            'Created Date': new Date(allocation.created_at).toLocaleDateString()
          };
        })
      );

      // Convert to CSV
      const fields = ['Trip Title', 'Trip Start Date', 'Trip End Date', 'Vendor Title', 'Vendor Type', 'Amount', 'Status', 'Description', 'Payment Date', 'Created Date'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(reportsWithDetails);

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=vendor_payments_report.csv');
      res.send(csv);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting CSV',
        error: error.message
      });
    }
  }
);

// Get filter options (for dropdowns)
router.get('/filter-options',
  protect,
  async (req, res) => {
    try {
      const trips = await Trip.findAll({
        attributes: ['id', 'title', 'start_date', 'end_date'],
        order: [['start_date', 'DESC']]
      });

      const accommodationVendors = await AccommodationVendor.findAll({
        attributes: ['id', 'title']
      });

      const foodVendors = await FoodVendor.findAll({
        attributes: ['id', 'title']
      });

      const transportVendors = await TransportVendor.findAll({
        attributes: ['id', 'title']
      });

      res.json({
        success: true,
        data: {
          trips,
          vendors: {
            accommodation: accommodationVendors,
            food: foodVendors,
            transport: transportVendors
          },
          statuses: ['pending', 'approved', 'processing', 'completed', 'cancelled'],
          vendorTypes: ['accommodation', 'food', 'transport']
        }
      });

    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching filter options',
        error: error.message
      });
    }
  }
);

module.exports = router;

