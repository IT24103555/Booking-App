const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['booking', 'event', 'ticket', 'venue', 'session', 'profile', 'system'],
      default: 'system',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: { type: Boolean, default: false, index: true },
    relatedEntityType: { type: String, default: '' },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);