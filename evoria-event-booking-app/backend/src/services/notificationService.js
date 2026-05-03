const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const validateObjectId = require('../utils/validateObjectId');

const VALID_TYPES = ['booking', 'event', 'ticket', 'venue', 'session', 'profile', 'system'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const normalizeType = (value) => (VALID_TYPES.includes(value) ? value : 'system');
const normalizePriority = (value) => (VALID_PRIORITIES.includes(value) ? value : 'medium');

const createNotification = async (
  userId,
  title,
  message,
  type = 'system',
  priority = 'medium',
  relatedEntityType = '',
  relatedEntityId = null
) => {
  if (!validateObjectId(userId)) return null;

  const payload = {
    userId,
    title: String(title || '').trim(),
    message: String(message || '').trim(),
    type: normalizeType(type),
    priority: normalizePriority(priority),
    relatedEntityType: String(relatedEntityType || '').trim(),
  };

  if (relatedEntityId && validateObjectId(relatedEntityId)) {
    payload.relatedEntityId = relatedEntityId;
  }

  return Notification.create(payload);
};

const createBroadcastNotification = async (title, message, type = 'system', priority = 'medium') => {
  const customers = await User.find({ role: 'customer', isActive: true }).select('_id');
  return Promise.all(
    customers.map((user) => createNotification(user._id, title, message, type, priority))
  );
};

const notifyUsersByEvent = async (eventId, payload) => {
  if (!validateObjectId(eventId)) return [];
  const userIds = await Booking.distinct('userId', { eventId, status: { $ne: 'Cancelled' } });
  return Promise.all(
    userIds.map((userId) => createNotification(userId, payload.title, payload.message, payload.type, payload.priority, payload.relatedEntityType, payload.relatedEntityId || eventId))
  );
};

const notifyUsersByVenue = async (venueId, payload) => {
  if (!validateObjectId(venueId)) return [];
  const eventIds = await Event.distinct('_id', { venueId });
  if (!eventIds.length) return [];
  const userIds = await Booking.distinct('userId', { eventId: { $in: eventIds }, status: { $ne: 'Cancelled' } });
  return Promise.all(
    userIds.map((userId) => createNotification(userId, payload.title, payload.message, payload.type, payload.priority, payload.relatedEntityType, payload.relatedEntityId || venueId))
  );
};

module.exports = {
  createNotification,
  createBroadcastNotification,
  notifyUsersByEvent,
  notifyUsersByVenue,
};