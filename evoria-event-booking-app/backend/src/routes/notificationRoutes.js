const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/my', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);
router.put('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);
router.post('/', protect, authorizeRoles('admin', 'organizer'), createNotification);
router.post('/broadcast', protect, authorizeRoles('admin', 'organizer'), broadcastNotification);

module.exports = router;