const express = require('express');
const router = express.Router();

// Import models
const Destination = require('../models/Destination');
const Trip = require('../models/Trip');
const Amenity = require('../models/Amenity');
const FoodCategory = require('../models/FoodCategory');
const FoodItem = require('../models/FoodItem');
const FoodSchedule = require('../models/FoodSchedule');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const AccommodationVendor = require('../models/AccommodationVendor');
const FoodVendor = require('../models/FoodVendor');
const TransportVendor = require('../models/TransportVendor');
const TripStatus = require('../models/TripStatus');
const Conductor = require('../models/Conductor');
const Event = require('../models/Event');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

// Mobile API - Read-only endpoints for all users

// Get all destinations
router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      attributes: ['title', 'description', 'latitude', 'longitude', 'address', 'created_at']
    });
    
    res.json({
      success: true,
      data: destinations,
      count: destinations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching destinations',
      error: error.message
    });
  }
});

// Get trips list (minimal data for listing page)
router.get('/trips', async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    
    // If status is provided, filter by it, otherwise show all trips
    if (status) {
      whereClause.trip_status_id = status;
    }
    
    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['title']
        },
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['name']
        }
      ],
      attributes: [
        'id', 'title', 'start_date', 'end_date', 'trip_status_id', 'created_at', 'updated_at'
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Add trip_role based on dates and status
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tripsWithRole = trips.map(trip => {
      const tripData = trip.toJSON();
      const startDate = new Date(tripData.start_date);
      const endDate = new Date(tripData.end_date);
      
      // Set time to start of day for comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      let tripRole = null;
      
      // Check if trip is published (trip_status_id = 2)
      if (tripData.trip_status_id === 2) {
        // Current: today >= start_date AND today <= end_date
        if (today >= startDate && today <= endDate) {
          tripRole = 'Current';
        }
        // Upcoming: today < start_date
        else if (today < startDate) {
          tripRole = 'Upcoming';
        }
      }
      
      return {
        ...tripData,
        trip_role: tripRole
      };
    });
    
    res.json({
      success: true,
      data: tripsWithRole,
      count: tripsWithRole.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: error.message
    });
  }
});

// Get only published trips
router.get('/trips/published', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: {
        trip_status_id: 2 // Published trips only
      },
      include: [
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['title', 'latitude', 'longitude', 'address']
        },
        {
          model: Bus,
          as: 'bus',
          attributes: ['title', 'model', 'make', 'no_of_sittings']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['first_name', 'last_name', 'phone_number']
        },
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['name', 'description']
        }
      ],
      attributes: [
        'id', 'title', 'start_date', 'end_date', 'trip_status_id', 'budget', 
        'description', 'boarding_details', 'created_at', 'updated_at'
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Add trip_role based on dates and status
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tripsWithRole = trips.map(trip => {
      const tripData = trip.toJSON();
      const startDate = new Date(tripData.start_date);
      const endDate = new Date(tripData.end_date);
      
      // Set time to start of day for comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      let tripRole = null;
      
      // Check if trip is published (trip_status_id = 2)
      if (tripData.trip_status_id === 2) {
        // Current: today >= start_date AND today <= end_date
        if (today >= startDate && today <= endDate) {
          tripRole = 'Current';
        }
        // Upcoming: today < start_date
        else if (today < startDate) {
          tripRole = 'Upcoming';
        }
      }
      
      return {
        ...tripData,
        trip_role: tripRole
      };
    });
    
    res.json({
      success: true,
      data: tripsWithRole,
      count: tripsWithRole.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching published trips',
      error: error.message
    });
  }
});

// Get trip by ID with full details for mobile app tabs
router.get('/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['title', 'description', 'latitude', 'longitude', 'address']
        },
        {
          model: Bus,
          as: 'bus',
          attributes: ['title', 'model', 'make', 'no_of_sittings', 'rc_no']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['first_name', 'last_name', 'phone_number', 'driving_license_no']
        },
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['name', 'description']
        },
        {
          model: TransportVendor,
          as: 'transportVendor',
          attributes: ['title', 'address', 'phone', 'email', 'description']
        },
        {
          model: AccommodationVendor,
          as: 'accommodationVendor',
          attributes: ['title', 'address', 'phone', 'email', 'description']
        },
        {
          model: FoodVendor,
          as: 'foodVendor',
          attributes: ['title', 'address', 'phone', 'email', 'description']
        }
      ]
    });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        error: 'Trip with the specified ID does not exist'
      });
    }
    
    // Get all vendors for reference
    const allTransportVendors = await TransportVendor.findAll({
      attributes: ['id', 'title', 'address', 'phone', 'email', 'description']
    });
    
    const allAccommodationVendors = await AccommodationVendor.findAll({
      attributes: ['id', 'title', 'address', 'phone', 'email', 'description']
    });
    
    const allFoodVendors = await FoodVendor.findAll({
      attributes: ['id', 'title', 'address', 'phone', 'email', 'description']
    });
    
    // Get all food-related data for reference
    const allFoodSchedules = await FoodSchedule.findAll({
      attributes: ['id', 'title', 'start_time', 'end_time']
    });
    
    const allFoodCategories = await FoodCategory.findAll({
      attributes: ['id', 'title', 'description']
    });
    
    const allFoodItems = await FoodItem.findAll({
      attributes: ['id', 'title', 'description']
    });
    
    // Get all drivers and conductors for reference
    const allDrivers = await Driver.findAll({
      attributes: ['id', 'first_name', 'last_name', 'phone_number', 'driving_license_no'],
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }]
    });
    
    const allConductors = await Conductor.findAll({
      attributes: ['id', 'first_name', 'last_name', 'phone_number'],
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }]
    });
    
    // Helper function to get vendor name by ID
    const getVendorName = (vendorId, vendors) => {
      const vendor = vendors.find(v => v.id === vendorId);
      return vendor ? vendor.title : 'Unknown Vendor';
    };
    
    // Helper function to get schedule name by ID
    const getScheduleName = (scheduleId) => {
      const schedule = allFoodSchedules.find(s => s.id === scheduleId);
      return schedule ? schedule.title : 'Unknown Schedule';
    };
    
    // Helper function to get category name by ID
    const getCategoryName = (categoryId) => {
      const category = allFoodCategories.find(c => c.id === categoryId);
      return category ? category.title : 'Unknown Category';
    };
    
    // Helper function to get item name by ID
    const getItemName = (itemId) => {
      const item = allFoodItems.find(i => i.id === itemId);
      return item ? item.title : 'Unknown Item';
    };
    
    // Parse and enhance JSON data with vendor names
    let enhancedAccommodationsByDay = {};
    if (trip.accommodations_by_day) {
      try {
        const accommodationsData = JSON.parse(trip.accommodations_by_day);
        Object.keys(accommodationsData).forEach(day => {
          enhancedAccommodationsByDay[day] = accommodationsData[day].map(item => ({
            ...item,
            vendor: getVendorName(item.vendor, allAccommodationVendors), // Replace ID with name
            vendorName: getVendorName(item.vendor, allAccommodationVendors)
          }));
        });
      } catch (e) {
        enhancedAccommodationsByDay = trip.accommodations_by_day;
      }
    }
    
    let enhancedFoodVendorsByDay = {};
    if (trip.food_vendors_by_day) {
      try {
        const foodData = JSON.parse(trip.food_vendors_by_day);
        Object.keys(foodData).forEach(day => {
          enhancedFoodVendorsByDay[day] = foodData[day].map(item => ({
            ...item,
            vendors: item.vendors.map(vendorId => getVendorName(vendorId, allFoodVendors)), // Replace IDs with names
            vendorNames: item.vendors.map(vendorId => getVendorName(vendorId, allFoodVendors)),
            schedules: item.schedules.map(scheduleId => getScheduleName(scheduleId)), // Replace IDs with names
            scheduleNames: item.schedules.map(scheduleId => getScheduleName(scheduleId)),
            categories: item.categories.map(categoryId => getCategoryName(categoryId)), // Replace IDs with names
            categoryNames: item.categories.map(categoryId => getCategoryName(categoryId)),
            items: item.items.map(itemId => getItemName(itemId)), // Replace IDs with names
            itemNames: item.items.map(itemId => getItemName(itemId))
          }));
        });
      } catch (e) {
        enhancedFoodVendorsByDay = trip.food_vendors_by_day;
      }
    }
    
    let enhancedFinanceData = {};
    if (trip.finance_data) {
      try {
        const financeData = JSON.parse(trip.finance_data);
        enhancedFinanceData = {
          ...financeData,
          vendors: financeData.vendors.map(vendor => ({
            ...vendor,
            vendorId: getVendorName(vendor.vendorId, 
              vendor.type === 'transport' ? allTransportVendors :
              vendor.type === 'accommodation' ? allAccommodationVendors :
              allFoodVendors
            ), // Replace ID with name
            vendorName: getVendorName(vendor.vendorId, 
              vendor.type === 'transport' ? allTransportVendors :
              vendor.type === 'accommodation' ? allAccommodationVendors :
              allFoodVendors
            )
          }))
        };
      } catch (e) {
        enhancedFinanceData = trip.finance_data;
      }
    }
    
    // Helper function to get driver details by ID
    const getDriverDetails = (driverId) => {
      const driver = allDrivers.find(d => d.id === driverId);
      return driver ? {
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        phone: driver.phone_number,
        license: driver.driving_license_no,
        vendor: driver.vendor ? driver.vendor.title : 'Unknown Vendor'
      } : null;
    };
    
    // Helper function to get conductor details by ID
    const getConductorDetails = (conductorId) => {
      const conductor = allConductors.find(c => c.id === conductorId);
      return conductor ? {
        id: conductor.id,
        name: `${conductor.first_name} ${conductor.last_name}`,
        phone: conductor.phone_number,
        vendor: conductor.vendor ? conductor.vendor.title : 'Unknown Vendor'
      } : null;
    };
    
    // Process selected drivers and conductors
    let enhancedSelectedDrivers = [];
    let enhancedSelectedConductors = [];
    
    if (trip.selected_drivers) {
      try {
        const selectedDriverIds = JSON.parse(trip.selected_drivers);
        enhancedSelectedDrivers = selectedDriverIds.map(driverId => getDriverDetails(driverId)).filter(driver => driver !== null);
      } catch (e) {
        enhancedSelectedDrivers = [];
      }
    }
    
    if (trip.selected_conductors) {
      try {
        const selectedConductorIds = JSON.parse(trip.selected_conductors);
        enhancedSelectedConductors = selectedConductorIds.map(conductorId => getConductorDetails(conductorId)).filter(conductor => conductor !== null);
      } catch (e) {
        enhancedSelectedConductors = [];
      }
    }
    
    // Create filtered trip object without id
    const filteredTrip = {
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      budget: trip.budget,
      created_by: trip.created_by,
      destination_id: trip.destination_id,
      bus_id: trip.bus_id,
      driver_id: trip.driver_id,
      boarding_details: trip.boarding_details,
      checklist_items: trip.checklist_items,
      accommodation_vendor_id: trip.accommodation_vendor_id,
      food_vendor_id: trip.food_vendor_id,
      transport_vendor_id: trip.transport_vendor_id,
      accommodation_vendor_name: trip.accommodation_vendor_id ? getVendorName(trip.accommodation_vendor_id, allAccommodationVendors) : null,
      food_vendor_name: trip.food_vendor_id ? getVendorName(trip.food_vendor_id, allFoodVendors) : null,
      transport_vendor_name: trip.transport_vendor_id ? getVendorName(trip.transport_vendor_id, allTransportVendors) : null,
      selected_drivers_details: enhancedSelectedDrivers,
      selected_conductors_details: enhancedSelectedConductors,
      selected_buses: trip.selected_buses,
      drivers_by_day: trip.drivers_by_day,
      conductors_by_day: trip.conductors_by_day,
      buses_by_day: trip.buses_by_day,
      vendors_by_day: trip.vendors_by_day,
      time_by_day: trip.time_by_day,
      accommodations_by_day: enhancedAccommodationsByDay,
      selected_accommodation_vendor: trip.selected_accommodation_vendor,
      selected_accommodation_start_time: trip.selected_accommodation_start_time,
      selected_accommodation_end_time: trip.selected_accommodation_end_time,
      selected_food_vendors: trip.selected_food_vendors,
      food_vendors_by_day: enhancedFoodVendorsByDay,
      selected_food_schedules: trip.selected_food_schedules,
      selected_food_categories: trip.selected_food_categories,
      selected_food_items: trip.selected_food_items,
      food_schedules_by_day: trip.food_schedules_by_day,
      food_categories_by_day: trip.food_categories_by_day,
      food_items_by_day: trip.food_items_by_day,
      all_days_food_entries: trip.all_days_food_entries,
      events_by_day: trip.events_by_day,
      all_days_events: trip.all_days_events,
      selected_event_title: trip.selected_event_title,
      selected_event_description: trip.selected_event_description,
      selected_event_start_time: trip.selected_event_start_time,
      selected_event_end_time: trip.selected_event_end_time,
      finance_data: enhancedFinanceData,
      use_all_days_selection: trip.use_all_days_selection,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      trip_status_id: trip.trip_status_id,
      destinationInfo: trip.destinationInfo,
      bus: trip.bus,
      driver: trip.driver,
      tripStatus: trip.tripStatus,
      transportVendor: trip.transportVendor,
      accommodationVendor: trip.accommodationVendor,
      foodVendor: trip.foodVendor
    };
    
    res.json({
      success: true,
      data: filteredTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trip',
      error: error.message
    });
  }
});

// Get trip details with all tab data (basic details, accommodation, food, transport)
router.get('/trips/:id/details', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: Destination,
          as: 'destinationInfo',
          attributes: ['title', 'description', 'latitude', 'longitude', 'address']
        },
        {
          model: Bus,
          as: 'bus',
          attributes: ['title', 'model', 'make', 'no_of_sittings', 'rc_no']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['first_name', 'last_name', 'phone_number', 'driving_license_no']
        },
        {
          model: TripStatus,
          as: 'tripStatus',
          attributes: ['name', 'description']
        },
        {
          model: TransportVendor,
          as: 'transportVendor',
          attributes: ['title', 'address', 'phone', 'email', 'description']
        },
        {
          model: AccommodationVendor,
          as: 'accommodationVendor',
          attributes: ['title', 'address', 'phone', 'email', 'description']
        },
        {
          model: FoodVendor,
          as: 'foodVendor',
          attributes: ['title', 'address', 'phone', 'email', 'description']
        }
      ]
    });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
        error: 'Trip with the specified ID does not exist'
      });
    }
    
    // Get accommodation data
    const accommodationVendors = await AccommodationVendor.findAll({
      attributes: ['title', 'address', 'phone', 'email', 'description']
    });
    
    // Get food management data
    const foodCategories = await FoodCategory.findAll({
      include: [{
        model: FoodItem,
        as: 'items',
        attributes: ['title', 'description']
      }],
      attributes: ['title', 'description']
    });
    
    const foodSchedules = await FoodSchedule.findAll({
      attributes: ['title', 'start_time', 'end_time']
    });
    
    const foodVendors = await FoodVendor.findAll({
      attributes: ['title', 'address', 'phone', 'email', 'description']
    });
    
    // Get transport data
    const buses = await Bus.findAll({
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }],
      attributes: ['title', 'model', 'make', 'no_of_sittings', 'rc_no']
    });
    
    const drivers = await Driver.findAll({
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }],
      attributes: ['first_name', 'last_name', 'phone_number', 'driving_license_no']
    });
    
    const conductors = await Conductor.findAll({
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }],
      attributes: ['first_name', 'last_name', 'phone_number']
    });
    
    const transportVendors = await TransportVendor.findAll({
      attributes: ['title', 'address', 'phone', 'email', 'description']
    });
    
    // Get amenities
    const amenities = await Amenity.findAll({
      attributes: ['title', 'description']
    });
    
    // Get all vendors for reference
    const allTransportVendors = await TransportVendor.findAll({
      attributes: ['id', 'title', 'address', 'phone', 'email', 'description']
    });
    
    const allAccommodationVendors = await AccommodationVendor.findAll({
      attributes: ['id', 'title', 'address', 'phone', 'email', 'description']
    });
    
    const allFoodVendors = await FoodVendor.findAll({
      attributes: ['id', 'title', 'address', 'phone', 'email', 'description']
    });
    
    // Get all food-related data for reference
    const allFoodSchedules = await FoodSchedule.findAll({
      attributes: ['id', 'title', 'start_time', 'end_time']
    });
    
    const allFoodCategories = await FoodCategory.findAll({
      attributes: ['id', 'title', 'description']
    });
    
    const allFoodItems = await FoodItem.findAll({
      attributes: ['id', 'title', 'description']
    });
    
    // Get all drivers and conductors for reference
    const allDrivers = await Driver.findAll({
      attributes: ['id', 'first_name', 'last_name', 'phone_number', 'driving_license_no'],
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }]
    });
    
    const allConductors = await Conductor.findAll({
      attributes: ['id', 'first_name', 'last_name', 'phone_number'],
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }]
    });
    
    // Helper function to get vendor name by ID
    const getVendorName = (vendorId, vendors) => {
      const vendor = vendors.find(v => v.id === vendorId);
      return vendor ? vendor.title : 'Unknown Vendor';
    };
    
    // Helper function to get driver details by ID
    const getDriverDetails = (driverId) => {
      const driver = allDrivers.find(d => d.id === driverId);
      return driver ? {
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        phone: driver.phone_number,
        license: driver.driving_license_no,
        vendor: driver.vendor ? driver.vendor.title : 'Unknown Vendor'
      } : null;
    };
    
    // Helper function to get conductor details by ID
    const getConductorDetails = (conductorId) => {
      const conductor = allConductors.find(c => c.id === conductorId);
      return conductor ? {
        id: conductor.id,
        name: `${conductor.first_name} ${conductor.last_name}`,
        phone: conductor.phone_number,
        vendor: conductor.vendor ? conductor.vendor.title : 'Unknown Vendor'
      } : null;
    };
    
    // Helper function to get schedule name by ID
    const getScheduleName = (scheduleId) => {
      const schedule = allFoodSchedules.find(s => s.id === scheduleId);
      return schedule ? schedule.title : 'Unknown Schedule';
    };
    
    // Helper function to get category name by ID
    const getCategoryName = (categoryId) => {
      const category = allFoodCategories.find(c => c.id === categoryId);
      return category ? category.title : 'Unknown Category';
    };
    
    // Helper function to get item name by ID
    const getItemName = (itemId) => {
      const item = allFoodItems.find(i => i.id === itemId);
      return item ? item.title : 'Unknown Item';
    };
    
    // Parse and enhance JSON data with vendor names
    let enhancedAccommodationsByDay = {};
    if (trip.accommodations_by_day) {
      try {
        const accommodationsData = JSON.parse(trip.accommodations_by_day);
        Object.keys(accommodationsData).forEach(day => {
          enhancedAccommodationsByDay[day] = accommodationsData[day].map(item => ({
            ...item,
            vendor: getVendorName(item.vendor, allAccommodationVendors), // Replace ID with name
            vendorName: getVendorName(item.vendor, allAccommodationVendors)
          }));
        });
      } catch (e) {
        enhancedAccommodationsByDay = trip.accommodations_by_day;
      }
    }
    
    let enhancedFoodVendorsByDay = {};
    if (trip.food_vendors_by_day) {
      try {
        const foodData = JSON.parse(trip.food_vendors_by_day);
        Object.keys(foodData).forEach(day => {
          enhancedFoodVendorsByDay[day] = foodData[day].map(item => ({
            ...item,
            vendors: item.vendors.map(vendorId => getVendorName(vendorId, allFoodVendors)), // Replace IDs with names
            vendorNames: item.vendors.map(vendorId => getVendorName(vendorId, allFoodVendors)),
            schedules: item.schedules.map(scheduleId => getScheduleName(scheduleId)), // Replace IDs with names
            scheduleNames: item.schedules.map(scheduleId => getScheduleName(scheduleId)),
            categories: item.categories.map(categoryId => getCategoryName(categoryId)), // Replace IDs with names
            categoryNames: item.categories.map(categoryId => getCategoryName(categoryId)),
            items: item.items.map(itemId => getItemName(itemId)), // Replace IDs with names
            itemNames: item.items.map(itemId => getItemName(itemId))
          }));
        });
      } catch (e) {
        enhancedFoodVendorsByDay = trip.food_vendors_by_day;
      }
    }
    
    let enhancedFinanceData = {};
    if (trip.finance_data) {
      try {
        const financeData = JSON.parse(trip.finance_data);
        enhancedFinanceData = {
          ...financeData,
          vendors: financeData.vendors.map(vendor => ({
            ...vendor,
            vendorId: getVendorName(vendor.vendorId, 
              vendor.type === 'transport' ? allTransportVendors :
              vendor.type === 'accommodation' ? allAccommodationVendors :
              allFoodVendors
            ), // Replace ID with name
            vendorName: getVendorName(vendor.vendorId, 
              vendor.type === 'transport' ? allTransportVendors :
              vendor.type === 'accommodation' ? allAccommodationVendors :
              allFoodVendors
            )
          }))
        };
      } catch (e) {
        enhancedFinanceData = trip.finance_data;
      }
    }
    
    // Parse and enhance selected drivers and conductors
    let enhancedSelectedDrivers = [];
    if (trip.selected_drivers) {
      try {
        const driverIds = JSON.parse(trip.selected_drivers);
        enhancedSelectedDrivers = driverIds.map(driverId => getDriverDetails(driverId)).filter(Boolean);
      } catch (e) {
        enhancedSelectedDrivers = [];
      }
    }
    
    let enhancedSelectedConductors = [];
    if (trip.selected_conductors) {
      try {
        const conductorIds = JSON.parse(trip.selected_conductors);
        enhancedSelectedConductors = conductorIds.map(conductorId => getConductorDetails(conductorId)).filter(Boolean);
      } catch (e) {
        enhancedSelectedConductors = [];
      }
    }
    
    // Create filtered trip object without id
    const filteredTrip = {
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      budget: trip.budget,
      created_by: trip.created_by,
      destination_id: trip.destination_id,
      bus_id: trip.bus_id,
      driver_id: trip.driver_id,
      boarding_details: trip.boarding_details,
      checklist_items: trip.checklist_items,
      accommodation_vendor_id: trip.accommodation_vendor_id,
      food_vendor_id: trip.food_vendor_id,
      transport_vendor_id: trip.transport_vendor_id,
      accommodation_vendor_name: trip.accommodation_vendor_id ? getVendorName(trip.accommodation_vendor_id, allAccommodationVendors) : null,
      food_vendor_name: trip.food_vendor_id ? getVendorName(trip.food_vendor_id, allFoodVendors) : null,
      transport_vendor_name: trip.transport_vendor_id ? getVendorName(trip.transport_vendor_id, allTransportVendors) : null,
      selected_drivers_details: enhancedSelectedDrivers,
      selected_conductors_details: enhancedSelectedConductors,
      selected_buses: trip.selected_buses,
      drivers_by_day: trip.drivers_by_day,
      conductors_by_day: trip.conductors_by_day,
      buses_by_day: trip.buses_by_day,
      vendors_by_day: trip.vendors_by_day,
      time_by_day: trip.time_by_day,
      accommodations_by_day: enhancedAccommodationsByDay,
      selected_accommodation_vendor: trip.selected_accommodation_vendor,
      selected_accommodation_start_time: trip.selected_accommodation_start_time,
      selected_accommodation_end_time: trip.selected_accommodation_end_time,
      selected_food_vendors: trip.selected_food_vendors,
      food_vendors_by_day: enhancedFoodVendorsByDay,
      selected_food_schedules: trip.selected_food_schedules,
      selected_food_categories: trip.selected_food_categories,
      selected_food_items: trip.selected_food_items,
      food_schedules_by_day: trip.food_schedules_by_day,
      food_categories_by_day: trip.food_categories_by_day,
      food_items_by_day: trip.food_items_by_day,
      all_days_food_entries: trip.all_days_food_entries,
      events_by_day: trip.events_by_day,
      all_days_events: trip.all_days_events,
      selected_event_title: trip.selected_event_title,
      selected_event_description: trip.selected_event_description,
      selected_event_start_time: trip.selected_event_start_time,
      selected_event_end_time: trip.selected_event_end_time,
      finance_data: enhancedFinanceData,
      use_all_days_selection: trip.use_all_days_selection,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      trip_status_id: trip.trip_status_id,
      destinationInfo: trip.destinationInfo,
      bus: trip.bus,
      driver: trip.driver,
      tripStatus: trip.tripStatus,
      transportVendor: trip.transportVendor,
      accommodationVendor: trip.accommodationVendor,
      foodVendor: trip.foodVendor
    };

    res.json({
      success: true,
      data: filteredTrip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trip details',
      error: error.message
    });
  }
});

// Get all amenities
router.get('/amenities', async (req, res) => {
  try {
    const amenities = await Amenity.findAll({
      attributes: ['title', 'description', 'created_at']
    });
    
    res.json({
      success: true,
      data: amenities,
      count: amenities.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching amenities',
      error: error.message
    });
  }
});

// Get food categories
router.get('/food-categories', async (req, res) => {
  try {
    const categories = await FoodCategory.findAll({
      include: [{
        model: FoodItem,
        as: 'items',
        attributes: ['title', 'description']
      }],
      attributes: ['title', 'description', 'created_at']
    });
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food categories',
      error: error.message
    });
  }
});

// Get food items
router.get('/food-items', async (req, res) => {
  try {
    const items = await FoodItem.findAll({
      include: [{
        model: FoodCategory,
        as: 'category',
        attributes: ['title']
      }],
      attributes: ['title', 'description', 'created_at']
    });
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food items',
      error: error.message
    });
  }
});

// Get food schedules
router.get('/food-schedules', async (req, res) => {
  try {
    const schedules = await FoodSchedule.findAll({
      attributes: ['title', 'start_time', 'end_time', 'created_at']
    });
    
    res.json({
      success: true,
      data: schedules,
      count: schedules.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food schedules',
      error: error.message
    });
  }
});

// Get buses
router.get('/buses', async (req, res) => {
  try {
    const buses = await Bus.findAll({
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }],
      attributes: [
        'title', 'model', 'make', 'make_year', 'type', 
        'no_of_sittings', 'rc_no', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: buses,
      count: buses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error.message
    });
  }
});

// Get drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }],
      attributes: [
        'first_name', 'last_name', 'phone_number', 
        'driving_license_no', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: drivers,
      count: drivers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: error.message
    });
  }
});

// Get accommodation vendors
router.get('/accommodation-vendors', async (req, res) => {
  try {
    const vendors = await AccommodationVendor.findAll({
      attributes: [
        'id', 'title', 'address', 'phone', 'email', 
        'description', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching accommodation vendors',
      error: error.message
    });
  }
});

// Get food vendors
router.get('/food-vendors', async (req, res) => {
  try {
    const vendors = await FoodVendor.findAll({
      attributes: [
        'id', 'title', 'address', 'phone', 'email', 
        'description', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food vendors',
      error: error.message
    });
  }
});

// Get transport vendors
router.get('/transport-vendors', async (req, res) => {
  try {
    const vendors = await TransportVendor.findAll({
      attributes: [
        'id', 'title', 'address', 'phone', 'email', 
        'description', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transport vendors',
      error: error.message
    });
  }
});

// Get trip statuses
router.get('/trip-statuses', async (req, res) => {
  try {
    const statuses = await TripStatus.findAll({
      where: { is_active: true },
      attributes: ['name', 'description']
    });
    
    res.json({
      success: true,
      data: statuses,
      count: statuses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trip statuses',
      error: error.message
    });
  }
});

// Get conductors
router.get('/conductors', async (req, res) => {
  try {
    const conductors = await Conductor.findAll({
      include: [{
        model: TransportVendor,
        as: 'vendor',
        attributes: ['title']
      }],
      attributes: [
        'first_name', 'last_name', 'phone_number', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: conductors,
      count: conductors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conductors',
      error: error.message
    });
  }
});

// Get events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: [
        'title', 'description', 'start_time', 'end_time', 
        'trip_id', 'created_at'
      ],
      order: [['start_time', 'ASC']]
    });
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// Get events by trip ID
router.get('/events/trip/:tripId', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { trip_id: req.params.tripId },
      attributes: [
        'title', 'description', 'start_time', 'end_time', 
        'trip_id', 'created_at'
      ],
      order: [['start_time', 'ASC']]
    });
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trip events',
      error: error.message
    });
  }
});

// Get support tickets
router.get('/support-tickets', async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'email']
      }],
      attributes: [
        'title', 'description', 'status', 'priority', 
        'user_id', 'created_at', 'updated_at'
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets',
      error: error.message
    });
  }
});

// Get all data summary (dashboard data)
router.get('/summary', async (req, res) => {
  try {
    const [
      destinationsCount,
      tripsCount,
      amenitiesCount,
      busesCount,
      driversCount,
      conductorsCount,
      accommodationVendorsCount,
      foodVendorsCount,
      transportVendorsCount,
      eventsCount,
      supportTicketsCount
    ] = await Promise.all([
      Destination.count(),
      Trip.count(),
      Amenity.count(),
      Bus.count(),
      Driver.count(),
      Conductor.count(),
      AccommodationVendor.count(),
      FoodVendor.count(),
      TransportVendor.count(),
      Event.count(),
      SupportTicket.count()
    ]);
    
    res.json({
      success: true,
      data: {
        destinations: destinationsCount,
        trips: tripsCount,
        amenities: amenitiesCount,
        buses: busesCount,
        drivers: driversCount,
        conductors: conductorsCount,
        accommodation_vendors: accommodationVendorsCount,
        food_vendors: foodVendorsCount,
        transport_vendors: transportVendorsCount,
        events: eventsCount,
        support_tickets: supportTicketsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching summary data',
      error: error.message
    });
  }
});

// Get comprehensive dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all trips for detailed analysis
    const allTrips = await Trip.findAll({
      attributes: ['id', 'start_date', 'end_date', 'trip_status_id', 'budget'],
      include: [{
        model: TripStatus,
        as: 'tripStatus',
        attributes: ['name']
      }]
    });
    
    // Calculate trip statistics
    const tripStats = {
      total: allTrips.length,
      upcoming: 0,
      past: 0,
      completed: 0,
      cancelled: 0
    };
    
    allTrips.forEach(trip => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      
      // Set time to start of day for comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (trip.tripStatus && trip.tripStatus.name) {
        const status = trip.tripStatus.name.toLowerCase();
        if (status.includes('completed')) {
          tripStats.completed++;
        } else if (status.includes('cancelled')) {
          tripStats.cancelled++;
        } else if (today < startDate) {
          tripStats.upcoming++;
        } else if (today > endDate) {
          tripStats.past++;
        }
      } else {
        // Fallback to date-based logic
        if (today < startDate) {
          tripStats.upcoming++;
        } else if (today > endDate) {
          tripStats.past++;
        }
      }
    });
    
    // Get user statistics
    const allUsers = await User.findAll({
      attributes: ['id', 'isActive', 'createdAt']
    });
    
    const userStats = {
      total: allUsers.length,
      pending: allUsers.filter(u => !u.isActive).length,
      verified: allUsers.filter(u => u.isActive).length,
      inProgress: 0 // This would need business logic
    };
    
    // Get support ticket statistics
    const allTickets = await SupportTicket.findAll({
      attributes: ['id', 'status']
    });
    
    const supportStats = {
      total: allTickets.length,
      byStatus: allTickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {})
    };
    
    // Calculate financial statistics (placeholder - would need actual finance data)
    const totalBudget = allTrips.reduce((sum, trip) => sum + (parseFloat(trip.budget) || 0), 0);
    
    const financialStats = {
      total: totalBudget,
      published: totalBudget * 0.7, // Placeholder calculation
      draft: totalBudget * 0.2,
      pastPublished: totalBudget * 0.4,
      futurePublished: totalBudget * 0.3
    };
    
    res.json({
      success: true,
      data: {
        trips: tripStats,
        users: userStats,
        supportTickets: supportStats,
        funds: financialStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Mobile Registration API
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      registrationMethod, // 'email', 'phone', 'digilocker'
      digilockerData // optional, for digilocker registration
    } = req.body;

    // Validation - firstName and lastName are optional for mobile registration
    // They can be provided later during Aadhaar verification

    if (registrationMethod === 'email' && !email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for email registration'
      });
    }

    if (registrationMethod === 'phone' && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for phone registration'
      });
    }

    if (registrationMethod === 'digilocker' && !digilockerData) {
      return res.status(400).json({
        success: false,
        message: 'Digilocker data is required for digilocker registration'
      });
    }

    // Check if user already exists
    let existingUser = null;
    if (email) {
      existingUser = await User.findOne({ where: { email } });
    }
    if (phone && !existingUser) {
      existingUser = await User.findOne({ where: { phone } });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Generate OTP for verification (hardcoded as 1111 for demo)
    const otp = '1111';
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user data
    const userData = {
      firstName: firstName || null, // Optional for mobile registration
      lastName: lastName || null,   // Optional for mobile registration
      email: email || null,
      phone: phone || null,
      password: password || null, // null for digilocker registration
      role: 'user',
      isActive: false, // pending verification
      registrationMethod,
      otp,
      otpExpiry,
      isEmailVerified: false,
      isPhoneVerified: false,
      age: null, // will be set after verification
      digilockerData: digilockerData || null,
      accountStatus: 'pending'
    };

    // For digilocker registration, extract age from digilocker data
    if (registrationMethod === 'digilocker' && digilockerData && digilockerData.age) {
      userData.age = digilockerData.age;
      userData.isEmailVerified = true; // Age automatically verified
    }

    // Create user
    const user = await User.create(userData);

    // Send OTP (for demo, just return it)
    let otpSent = false;
    if (registrationMethod === 'email' && email) {
      // In real implementation, send email with OTP
      console.log(`OTP for ${email}: ${otp}`);
      otpSent = true;
    }
    if (registrationMethod === 'phone' && phone) {
      // In real implementation, send SMS with OTP
      console.log(`OTP for ${phone}: ${otp}`);
      otpSent = true;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your account.',
      data: {
        userId: user.id,
        registrationMethod,
        otpSent,
        otp: otp, // For demo purposes only
        requiresVerification: true,
        nextStep: 'verification'
      }
    });

  } catch (error) {
    console.error('Mobile registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
});

// Mobile OTP Verification API
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp, verificationType } = req.body; // verificationType: 'email' or 'phone'

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is correct
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Update verification status
    const updateData = {
      otp: null,
      otpExpiry: null
    };

    if (verificationType === 'email') {
      updateData.isEmailVerified = true;
    } else if (verificationType === 'phone') {
      updateData.isPhoneVerified = true;
    }

    // If both email and phone are verified, activate user
    const emailVerified = verificationType === 'email' ? true : user.isEmailVerified;
    const phoneVerified = verificationType === 'phone' ? true : user.isPhoneVerified;
    
    if (emailVerified && phoneVerified) {
      updateData.isActive = true;
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Verification successful',
      data: {
        userId: user.id,
        isActive: updateData.isActive || false,
        isEmailVerified: emailVerified,
        isPhoneVerified: phoneVerified,
        nextStep: updateData.isActive ? 'dashboard' : 'complete_verification'
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during OTP verification',
      error: error.message
    });
  }
});

// Mobile Resend OTP API
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId, verificationType } = req.body; // verificationType: 'email' or 'phone'

    if (!userId || !verificationType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification type are required'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = '1111'; // Hardcoded for demo
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({ otp, otpExpiry });

    // Send OTP (for demo, just log it)
    if (verificationType === 'email' && user.email) {
      console.log(`New OTP for ${user.email}: ${otp}`);
    }
    if (verificationType === 'phone' && user.phone) {
      console.log(`New OTP for ${user.phone}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        userId: user.id,
        verificationType,
        otp: otp, // For demo purposes only
        otpSent: true
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
});

// Mobile Login API
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Find user by email or phone
    let user = null;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (phone) {
      user = await User.findOne({ where: { phone } });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is verified
    if (!user.isActive) {
      let message = 'Account not verified. Please verify your account first.';
      
      if (user.accountStatus === 'pending' || user.accountStatus === 'in_verification') {
        message = 'Your account is in review, you will receive notification as soon as your account is approved';
      }
      
      return res.status(401).json({
        success: false,
        message: message,
        data: {
          userId: user.id,
          requiresVerification: true,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          accountStatus: user.accountStatus
        }
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// Mobile Aadhaar Verification API
router.post('/verify-aadhaar', async (req, res) => {
  try {
    const { 
      userId, 
      aadhaarNumber, 
      aadhaarFrontImage, 
      aadhaarBackImage,
      aadhaarName,
      aadhaarAddress,
      age
    } = req.body;

    if (!userId || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Aadhaar number are required'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user with Aadhaar data
    const updateData = {
      aadhaarNumber,
      aadhaarFrontImage: aadhaarFrontImage || null,
      aadhaarBackImage: aadhaarBackImage || null,
      aadhaarName: aadhaarName || null,
      aadhaarAddress: aadhaarAddress || null,
      accountStatus: 'in_verification',
      age: age || null
    };

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Aadhaar verification submitted successfully. Your account is under review.',
      data: {
        userId: user.id,
        accountStatus: 'in_verification',
        nextStep: 'wait_for_approval'
      }
    });

  } catch (error) {
    console.error('Aadhaar verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during Aadhaar verification',
      error: error.message
    });
  }
});

// Mobile Account Status Check API
router.get('/account-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        requiresVerification: !user.isActive,
        message: user.accountStatus === 'pending' || user.accountStatus === 'in_verification' 
          ? 'Your account is in review, you will receive notification as soon as your account is approved'
          : null
      }
    });

  } catch (error) {
    console.error('Account status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking account status',
      error: error.message
    });
  }
});

module.exports = router;
