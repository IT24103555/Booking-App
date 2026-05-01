const express = require('express');
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getSingleBooking,
  updateBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getSingleBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Staff routes
router.get('/', protect, authorizeRoles('admin', 'organizer'), getAllBookings);
router.put('/:id', protect, authorizeRoles('admin', 'organizer'), updateBooking);
router.put('/:id/confirm', protect, authorizeRoles('admin', 'organizer'), confirmBooking);
router.delete('/:id', protect, authorizeRoles('admin', 'organizer'), deleteBooking);

module.exports = router;
