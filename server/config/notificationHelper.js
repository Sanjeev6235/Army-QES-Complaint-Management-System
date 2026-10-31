const Notification = require('../models/Notification');

const createNotification = async (app, { recipient, type, message, complaint }) => {
  try {
    const notification = await Notification.create({ recipient, type, message, complaint });

    // Emit real-time notification via Socket.io
    const io = app.get('io');

    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification', {
          _id: notification._id,
          type,
          message,
          complaint,
          isRead: false,
          createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

module.exports = { createNotification };
