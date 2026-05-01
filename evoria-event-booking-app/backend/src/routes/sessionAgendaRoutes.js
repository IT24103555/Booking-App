const express = require('express');
const {
  createSessionAgenda,
  getAllSessionAgendas,
  getSessionsByEvent,
  getSingleSessionAgenda,
  updateSessionAgenda,
  deleteSessionAgenda,
} = require('../controllers/sessionAgendaController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getAllSessionAgendas);
router.get('/event/:eventId', getSessionsByEvent);
router.get('/:id', getSingleSessionAgenda);

router.post('/', protect, authorizeRoles('admin', 'organizer'), createSessionAgenda);
router.put('/:id', protect, authorizeRoles('admin', 'organizer'), updateSessionAgenda);
router.delete('/:id', protect, authorizeRoles('admin', 'organizer'), deleteSessionAgenda);

module.exports = router;
