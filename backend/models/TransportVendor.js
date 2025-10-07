const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransportVendor = sequelize.define('TransportVendor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  address: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(15), allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true }
}, {
  tableName: 'transport_vendors',
  underscored: true,
  timestamps: true
});

module.exports = TransportVendor;
