const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripLog = sequelize.define('TripLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  log_type: {
    type: DataTypes.ENUM(
      'TransportCheckIn',
      'TransportCheckOut',
      'AccommodationCheckIn',
      'AccommodationCheckOut',
      'EventCheckIn',
      'EventCheckOut'
    ),
    allowNull: false
  },
  log_item_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Vendor ID or Event Title'
  },
  trip_check_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'The specific date when check-in/check-out occurred'
  },
  scanned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'triplog',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
TripLog.associate = (models) => {
  TripLog.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  TripLog.belongsTo(models.Trip, {
    foreignKey: 'trip_id',
    as: 'trip'
  });
};

module.exports = TripLog;
