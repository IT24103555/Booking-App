const express = require('express');
const {
  createVenue,
  getAllVenues,
  getSingleVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAllVenues);
router.get('/:id', getSingleVenue);

// Using multipart/form-data is optional; you can also send "image" as a URL string
router.post('/', protect, authorizeRoles('admin', 'organizer'), upload.single('image'), createVenue);
router.put('/:id', protect, authorizeRoles('admin', 'organizer'), upload.single('image'), updateVenue);
router.delete('/:id', protect, authorizeRoles('admin', 'organizer'), deleteVenue);

module.exports = router;
