const { sequelize } = require('../config/database');

// Import all models so Sequelize knows about them before sync
const User = require('./User');
const Destination = require('./Destination');
const Amenity = require('./Amenity');
const Driver = require('./Driver');
const Bus = require('./Bus');
const Conductor = require('./Conductor');
const AccommodationVendor = require('./AccommodationVendor');
const FoodVendor = require('./FoodVendor');
const TransportVendor = require('./TransportVendor');
const SupportTicket = require('./SupportTicket');
const FoodSchedule = require('./FoodSchedule');
const FoodCategory = require('./FoodCategory');
const FoodItem = require('./FoodItem');
const Event = require('./Event');
const Trip = require('./Trip');
const TripStatus = require('./TripStatus');
const TripLog = require('./TripLog');
const TripPligrim = require('./TripPligrim');

// Associations
FoodCategory.hasMany(FoodItem, {
  foreignKey: 'food_category_id',
  as: 'items',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
FoodItem.belongsTo(FoodCategory, {
  foreignKey: 'food_category_id',
  as: 'category',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Transport Vendor Associations
TransportVendor.hasMany(Bus, {
  foreignKey: 'transport_vendor_id',
  as: 'buses',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Bus.belongsTo(TransportVendor, {
  foreignKey: 'transport_vendor_id',
  as: 'vendor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

TransportVendor.hasMany(Driver, {
  foreignKey: 'transport_vendor_id',
  as: 'drivers',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Driver.belongsTo(TransportVendor, {
  foreignKey: 'transport_vendor_id',
  as: 'vendor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

TransportVendor.hasMany(Conductor, {
  foreignKey: 'transport_vendor_id',
  as: 'conductors',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Conductor.belongsTo(TransportVendor, {
  foreignKey: 'transport_vendor_id',
  as: 'vendor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Trip Status Associations
TripStatus.hasMany(Trip, {
  foreignKey: 'trip_status_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(TripStatus, {
  foreignKey: 'trip_status_id',
  as: 'tripStatus',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Trip Associations
Destination.hasMany(Trip, {
  foreignKey: 'destination_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(Destination, {
  foreignKey: 'destination_id',
  as: 'destinationInfo',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Bus.hasMany(Trip, {
  foreignKey: 'bus_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(Bus, {
  foreignKey: 'bus_id',
  as: 'bus',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Driver.hasMany(Trip, {
  foreignKey: 'driver_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

TransportVendor.hasMany(Trip, {
  foreignKey: 'transport_vendor_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(TransportVendor, {
  foreignKey: 'transport_vendor_id',
  as: 'transportVendor',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Accommodation Vendor Associations
AccommodationVendor.hasMany(Trip, {
  foreignKey: 'accommodation_vendor_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(AccommodationVendor, {
  foreignKey: 'accommodation_vendor_id',
  as: 'accommodationVendor',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Food Vendor Associations
FoodVendor.hasMany(Trip, {
  foreignKey: 'food_vendor_id',
  as: 'trips',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Trip.belongsTo(FoodVendor, {
  foreignKey: 'food_vendor_id',
  as: 'foodVendor',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// TripLog Associations
User.hasMany(TripLog, {
  foreignKey: 'user_id',
  as: 'tripLogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
TripLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Trip.hasMany(TripLog, {
  foreignKey: 'trip_id',
  as: 'tripLogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
TripLog.belongsTo(Trip, {
  foreignKey: 'trip_id',
  as: 'trip',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// TripPligrim Associations
User.hasMany(TripPligrim, {
  foreignKey: 'userid',
  as: 'tripApplications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
TripPligrim.belongsTo(User, {
  foreignKey: 'userid',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Trip.hasMany(TripPligrim, {
  foreignKey: 'tripid',
  as: 'applications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
TripPligrim.belongsTo(Trip, {
  foreignKey: 'tripid',
  as: 'trip',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = {
  sequelize,
  User,
  Destination,
  Amenity,
  Driver,
  Bus,
  Conductor,
  AccommodationVendor,
  FoodVendor,
  TransportVendor,
  SupportTicket,
  FoodSchedule,
  FoodCategory,
  FoodItem,
  Event,
  Trip,
  TripStatus,
  TripLog,
  TripPligrim
};


