const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FoodCategory = sequelize.define('FoodCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'food_categories',
  underscored: true,
  timestamps: true
});

module.exports = FoodCategory;
