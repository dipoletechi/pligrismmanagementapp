const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FoodSchedule = sequelize.define('FoodSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false }
}, {
  tableName: 'food_schedules',
  underscored: true,
  timestamps: true
});

module.exports = FoodSchedule;
