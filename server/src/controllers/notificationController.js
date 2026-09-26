const notificationService = require('../services/notificationService');

class NotificationController {
  async getAll(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user.id, req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
