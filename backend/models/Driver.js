const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING(50), allowNull: false },
  last_name: { type: DataTypes.STRING(50), allowNull: false },
  phone_number: { type: DataTypes.STRING(15), allowNull: true },
  driving_license_no: { type: DataTypes.STRING(20), allowNull: true },
  aadhar_no: { type: DataTypes.STRING(12), allowNull: true },
  transport_vendor_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'drivers',
  underscored: true,
  timestamps: true
});

module.exports = Driver;
