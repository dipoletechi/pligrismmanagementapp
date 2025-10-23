const express = require('express');
const router = express.Router();
const { UserNotification, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// Send bulk notifications
router.post('/send-bulk', 
  protect,
  authorize('superadmin', 'admin', 'trip_manager'),
  async (req, res) => {
    try {
      console.log('Send bulk notification - User:', req.user?.email, 'Role:', req.user?.role);
      const { userIds, content, types } = req.body;

      // Validation
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Notification content is required'
        });
      }

      if (!types || (!types.email && !types.mobile && !types.text)) {
        return res.status(400).json({
          success: false,
          message: 'At least one notification type must be selected'
        });
      }

      // Build comma-separated notification type string
      const selectedTypes = [];
      if (types.mobile) selectedTypes.push('mobile');
      if (types.text) selectedTypes.push('text');
      if (types.email) selectedTypes.push('email');
      
      const notificationType = selectedTypes.join(',');

      // Create notification records for each user (bulk insertion)
      const notifications = userIds.map(userId => ({
        user_id: userId,
        content: content.trim(),
        notification_type: notificationType,
        status: 'pending',
        date: new Date()
      }));

      // Bulk insert
      const createdNotifications = await UserNotification.bulkCreate(notifications);

      console.log(`Created ${createdNotifications.length} notifications`);

      // TODO: Implement actual email/SMS sending logic here
      // For now, we just insert records with 'pending' status
      // You can create a background job to process these notifications

      res.status(201).json({
        success: true,
        message: `Notification queued for ${createdNotifications.length} user(s)`,
        data: {
          count: createdNotifications.length,
          notificationType: notificationType
        }
      });

    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notifications',
        error: error.message
      });
    }
  }
);

// Get all notifications
router.get('/',
  protect,
  authorize('superadmin', 'admin', 'trip_manager'),
  async (req, res) => {
    try {
      const notifications = await UserNotification.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
      });

    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }
);

// Get notifications by user ID
router.get('/user/:userId',
  protect,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Check if user is accessing their own notifications or is admin
      const isAdmin = ['superadmin', 'admin', 'trip_manager'].includes(req.user.role);
      if (req.user.id !== parseInt(userId) && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these notifications'
        });
      }

      const notifications = await UserNotification.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
      });

    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }
);

// Update notification status
router.put('/:id/status',
  protect,
  authorize('superadmin', 'admin', 'trip_manager'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, error_message } = req.body;

      if (!['pending', 'sent', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const notification = await UserNotification.findByPk(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      notification.status = status;
      if (error_message) {
        notification.error_message = error_message;
      }
      await notification.save();

      res.status(200).json({
        success: true,
        message: 'Notification status updated',
        data: notification
      });

    } catch (error) {
      console.error('Error updating notification status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification status',
        error: error.message
      });
    }
  }
);

module.exports = router;

