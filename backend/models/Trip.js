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
  status: { 
    type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'), 
    allowNull: false, 
    defaultValue: 'planned' 
  },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  destination_id: { type: DataTypes.INTEGER, allowNull: true },
  bus_id: { type: DataTypes.INTEGER, allowNull: true },
  driver_id: { type: DataTypes.INTEGER, allowNull: true },
  boarding_details: { type: DataTypes.TEXT, allowNull: true },
  checklist_items: { type: DataTypes.TEXT, allowNull: true },
  accommodation_vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  food_vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  transport_vendor_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'trips',
  underscored: true,
  timestamps: true
});

module.exports = Trip;
