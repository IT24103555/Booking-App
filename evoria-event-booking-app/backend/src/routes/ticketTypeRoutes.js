const express = require('express');
const {
  createTicketType,
  getAllTicketTypes,
  getSingleTicketType,
  updateTicketType,
  deleteTicketType,
} = require('../controllers/ticketTypeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getAllTicketTypes);
router.get('/:id', getSingleTicketType);

router.post('/', protect, authorizeRoles('admin', 'organizer'), createTicketType);
router.put('/:id', protect, authorizeRoles('admin', 'organizer'), updateTicketType);
router.delete('/:id', protect, authorizeRoles('admin', 'organizer'), deleteTicketType);

module.exports = router;
