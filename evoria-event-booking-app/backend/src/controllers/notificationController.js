const Notification = require('../models/Notification');
const validateObjectId = require('../utils/validateObjectId');
const {
  createNotification: createNotificationService,
  createBroadcastNotification,
} = require('../services/notificationService');

const VALID_TYPES = ['booking', 'event', 'ticket', 'venue', 'session', 'profile', 'system'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const getMyNotifications = async (req, res, next) => {
  try {
    const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Notifications fetched', data: items });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return res.status(200).json({ success: true, message: 'Unread count fetched', data: { count } });
  } catch (err) {
    next(err);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    notification.isRead = true;
    await notification.save();
    return res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (err) {
    next(err);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Debugging: log incoming delete requests to help diagnose client-side failures
    // (remove or reduce verbosity after debugging)
    // eslint-disable-next-line no-console
    console.log(`[notifications] DELETE called - id=${id} user=${req.user && req.user._id}`);
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const notification = await Notification.findById(id);
    // eslint-disable-next-line no-console
    console.log(`[notifications] found notification=${notification ? notification._id : 'null'} userId=${notification ? notification.userId : 'n/a'}`);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      // eslint-disable-next-line no-console
      console.log(`[notifications] forbidden delete attempt - notification.userId=${notification.userId} req.user=${req.user._id}`);
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await Notification.findByIdAndDelete(id);
    // eslint-disable-next-line no-console
    console.log(`[notifications] deleted ${id} by user ${req.user._id}`);
    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type, priority, relatedEntityType, relatedEntityId } = req.body;

    if (!validateObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }
    if (!String(title || '').trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!String(message || '').trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid notification priority' });
    }

    const created = await createNotificationService(
      userId,
      title,
      message,
      type,
      priority || 'medium',
      relatedEntityType,
      relatedEntityId
    );

    return res.status(201).json({ success: true, message: 'Notification created', data: created });
  } catch (err) {
    next(err);
  }
};

const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type, priority } = req.body;

    if (!String(title || '').trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!String(message || '').trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid notification priority' });
    }

    const created = await createBroadcastNotification(title, message, type, priority || 'medium');
    return res.status(201).json({ success: true, message: 'Broadcast notification created', data: created });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
};