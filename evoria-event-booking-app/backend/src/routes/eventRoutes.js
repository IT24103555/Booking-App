const express = require('express');
const {
  createEvent,
  getAllEvents,
  getAllEventsAdmin,
  getSingleEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAllEvents);
router.get('/admin/all', protect, authorizeRoles('admin', 'organizer'), getAllEventsAdmin);
router.get('/:id', getSingleEvent);

router.post('/', protect, authorizeRoles('admin', 'organizer'), upload.single('image'), createEvent);
router.put('/:id', protect, authorizeRoles('admin', 'organizer'), upload.single('image'), updateEvent);
router.delete('/:id', protect, authorizeRoles('admin', 'organizer'), deleteEvent);

module.exports = router;
