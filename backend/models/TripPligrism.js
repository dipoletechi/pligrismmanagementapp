const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripPligrism = sequelize.define('TripPligrism', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key'
  },
  tripid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to trips table',
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to users table',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Reject'),
    allowNull: false,
    defaultValue: 'Pending',
    comment: 'Application status'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: 'Record creation timestamp'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: 'Record update timestamp'
  }
}, {
  tableName: 'trip_pligrism',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_trip_pligrism_tripid',
      fields: ['tripid']
    },
    {
      name: 'idx_trip_pligrism_userid',
      fields: ['userid']
    },
    {
      name: 'idx_trip_pligrism_status',
      fields: ['status']
    },
    {
      name: 'idx_trip_pligrism_created_at',
      fields: ['created_at']
    },
    {
      name: 'unique_trip_user',
      fields: ['tripid', 'userid'],
      unique: true
    }
  ],
  comment: 'Table to track pilgrimage trip applications and approval status'
});

// Define associations
TripPligrism.associate = (models) => {
  // Belongs to Trip
  TripPligrism.belongsTo(models.Trip, {
    foreignKey: 'tripid',
    as: 'trip',
    onDelete: 'CASCADE'
  });

  // Belongs to User
  TripPligrism.belongsTo(models.User, {
    foreignKey: 'userid',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

module.exports = TripPligrism;
