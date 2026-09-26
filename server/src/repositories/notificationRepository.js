const prisma = require('../lib/prisma');

class NotificationRepository {
  async getForUser(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const where = { userId: Number(userId) };
    if (unreadOnly) where.isRead = false;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: Number(userId), isRead: false },
      }),
    ]);

    return { notifications, total, unreadCount, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id: Number(id), userId: Number(userId) },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId: Number(userId), isRead: false },
      data: { isRead: true },
    });
  }

  async create(data) {
    return prisma.notification.create({
      data: {
        userId: Number(data.userId),
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        referenceId: data.referenceId ? Number(data.referenceId) : null,
        referenceType: data.referenceType || null,
      },
    });
  }
}

module.exports = new NotificationRepository();
