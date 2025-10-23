const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserNotification = sequelize.define('UserNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notification_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'mobile',
    field: 'notification_type',
    comment: 'Comma-separated: mobile, text, email'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'date'
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  }
}, {
  tableName: 'user_notification',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

UserNotification.associate = (models) => {
  UserNotification.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = UserNotification;

