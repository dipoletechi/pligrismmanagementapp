const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  destination: { type: DataTypes.STRING(255), allowNull: true },
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: { type: DataTypes.DATE, allowNull: false },
  budget: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  destination_id: { type: DataTypes.INTEGER, allowNull: true },
  bus_id: { type: DataTypes.INTEGER, allowNull: true },
  driver_id: { type: DataTypes.INTEGER, allowNull: true },
  boarding_details: { type: DataTypes.TEXT, allowNull: true },
  checklist_items: { type: DataTypes.TEXT, allowNull: true },
  accommodation_vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  food_vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  transport_vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  // Complex data fields for trip configuration
  selected_drivers: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_conductors: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_buses: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  drivers_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  conductors_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  buses_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  vendors_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  time_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  accommodations_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_accommodation_vendor: { type: DataTypes.STRING(255), allowNull: true },
  selected_accommodation_start_time: { type: DataTypes.STRING(50), allowNull: true },
  selected_accommodation_end_time: { type: DataTypes.STRING(50), allowNull: true },
  selected_food_vendors: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  food_vendors_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_food_schedules: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_food_categories: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_food_items: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  food_schedules_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  food_categories_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  food_items_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  all_days_food_entries: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  events_by_day: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  all_days_events: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  selected_event_title: { type: DataTypes.STRING(255), allowNull: true },
  selected_event_description: { type: DataTypes.TEXT, allowNull: true },
  selected_event_start_time: { type: DataTypes.STRING(50), allowNull: true },
  selected_event_end_time: { type: DataTypes.STRING(50), allowNull: true },
  // finance_data removed - now using trip_vendor_allocations table
  use_all_days_selection: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
}, {
  tableName: 'trips',
  underscored: true,
  timestamps: true
});

// Define associations
Trip.associate = function(models) {
  // Trip has many Events
  Trip.hasMany(models.Event, {
    foreignKey: 'trip_id',
    as: 'events',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

module.exports = Trip;
