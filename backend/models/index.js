const { sequelize } = require('../config/database');

// Import all models so Sequelize knows about them before sync
const User = require('./User');
const Destination = require('./Destination');
const Amenity = require('./Amenity');
const Driver = require('./Driver');
const Bus = require('./Bus');
const AccommodationVendor = require('./AccommodationVendor');
const FoodVendor = require('./FoodVendor');
const TransportVendor = require('./TransportVendor');
const SupportTicket = require('./SupportTicket');
const FoodSchedule = require('./FoodSchedule');
const FoodCategory = require('./FoodCategory');
const FoodItem = require('./FoodItem');

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

module.exports = {
  sequelize,
  User,
  Destination,
  Amenity,
  Driver,
  Bus,
  AccommodationVendor,
  FoodVendor,
  TransportVendor,
  SupportTicket,
  FoodSchedule,
  FoodCategory,
  FoodItem
};


