const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TripFeedback = sequelize.define('TripFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'trip_id',
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  transport_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  food_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  event_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  destination_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  overall_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'trip_feedback',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false  // Disable updatedAt since column doesn't exist
});

// TripFeedback.associate = (models) => {
//   TripFeedback.belongsTo(models.User, {
//     foreignKey: 'user_id',
//     as: 'user'
//   });
//   TripFeedback.belongsTo(models.Trip, {
//     foreignKey: 'trip_id',
//     as: 'trip'
//   });
// };

module.exports = TripFeedback;
