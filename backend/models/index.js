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
  TripStatus
};


