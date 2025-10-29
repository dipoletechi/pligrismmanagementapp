const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bus = sequelize.define('Bus', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  rc_no: { type: DataTypes.STRING(20), allowNull: true },
  rc_date: { type: DataTypes.DATE, allowNull: true },
  expiry_date: { type: DataTypes.DATE, allowNull: true },
  puc_no: { type: DataTypes.STRING(20), allowNull: true },
  insurance_no: { type: DataTypes.STRING(30), allowNull: true },
  model: { type: DataTypes.STRING(50), allowNull: true },
  make_year: { type: DataTypes.INTEGER, allowNull: true },
  make: { type: DataTypes.STRING(30), allowNull: true },
  type: { type: DataTypes.ENUM('bus', 'traveller', 'car'), allowNull: true },
  no_of_sittings: { type: DataTypes.INTEGER, allowNull: true },
  transport_vendor_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'bus_details',
  underscored: true,
  timestamps: true
});

module.exports = Bus;
