const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripVendorAllocation = sequelize.define('TripVendorAllocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  vendor_type: {
    type: DataTypes.ENUM('transport', 'accommodation', 'food'),
    allowNull: false
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending', 'approved'),
    defaultValue: 'pending'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'trip_vendor_allocations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TripVendorAllocation;

