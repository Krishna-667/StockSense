const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async getUserNotifications(userId, params) {
    return notificationRepository.getForUser(userId, params);
  }

  async markAsRead(id, userId) {
    await notificationRepository.markAsRead(id, userId);
    return { success: true };
  }

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return { success: true };
  }
}

module.exports = new NotificationService();
