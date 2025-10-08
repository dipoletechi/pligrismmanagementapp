const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conductor = sequelize.define('Conductor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING(50), allowNull: false },
  last_name: { type: DataTypes.STRING(50), allowNull: false },
  phone_number: { type: DataTypes.STRING(15), allowNull: true },
  transport_vendor_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'conductors',
  underscored: true,
  timestamps: true
});

module.exports = Conductor;
