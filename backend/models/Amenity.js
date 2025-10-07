const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Amenity = sequelize.define('Amenity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true }
}, {
  tableName: 'amenities',
  underscored: true,
  timestamps: true
});

module.exports = Amenity;


