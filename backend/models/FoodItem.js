const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FoodItem = sequelize.define('FoodItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  food_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'food_categories',
      key: 'id'
    }
  }
}, {
  tableName: 'food_items',
  underscored: true,
  timestamps: true
});

module.exports = FoodItem;
