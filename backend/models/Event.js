const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (event) => {
      event.created_at = new Date();
      event.updated_at = new Date();
    },
    beforeUpdate: (event) => {
      event.updated_at = new Date();
    }
  }
});

// Define associations
Event.associate = function(models) {
  // Event belongs to Trip
  Event.belongsTo(models.Trip, {
    foreignKey: 'trip_id',
    as: 'trip',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

module.exports = Event;
