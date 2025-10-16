const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripPligrim = sequelize.define('TripPligrim', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tripid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Reject'),
    allowNull: false,
    defaultValue: 'Pending'
  }
}, {
  tableName: 'trip_pligrim',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TripPligrim;