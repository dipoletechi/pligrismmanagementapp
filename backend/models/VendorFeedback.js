const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VendorFeedback = sequelize.define('VendorFeedback', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ratings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  datetime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  vendorid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'vendor_feedback',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// VendorFeedback.associate = (models) => {
//   VendorFeedback.belongsTo(models.User, {
//     foreignKey: 'userId',
//     as: 'user'
//   });
//   VendorFeedback.belongsTo(models.Trip, {
//     foreignKey: 'tripid',
//     as: 'trip'
//   });
// };

module.exports = VendorFeedback;
