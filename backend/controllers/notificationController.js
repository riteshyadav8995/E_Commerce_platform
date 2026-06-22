const prisma = require('../utils/prisma');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    // Only fetch for admin or specific user. We will assume admin for now, so fetch all notifications where userId is null or matches.
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNotifications, markAsRead };
