const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Destination = sequelize.define('Destination', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'destinations',
  underscored: true,
  timestamps: true
});

module.exports = Destination;


