const SessionAgenda = require('../models/SessionAgenda');
const Event = require('../models/Event');
const validateObjectId = require('../utils/validateObjectId');
const { createSessionAgendaSchema, updateSessionAgendaSchema } = require('../validations/sessionAgendaValidation');

// POST /api/session-agendas
const createSessionAgenda = async (req, res, next) => {
  try {
    const { error, value } = createSessionAgendaSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details[0].context && error.details[0].context.message
        ? error.details[0].context.message
        : error.details[0].message;
      return res.status(400).json({ success: false, message: msg });
    }

    if (!validateObjectId(value.eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid eventId' });
    }
    const event = await Event.findById(value.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const created = await SessionAgenda.create(value);
    const populated = await SessionAgenda.findById(created._id).populate('eventId');
    return res.status(201).json({ success: true, message: 'Session agenda created', data: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/session-agendas
const getAllSessionAgendas = async (req, res, next) => {
  try {
    const items = await SessionAgenda.find().populate('eventId').sort({ eventId: 1, orderNo: 1 });
    return res.status(200).json({ success: true, message: 'Session agendas fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/session-agendas/event/:eventId
const getSessionsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!validateObjectId(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }
    const items = await SessionAgenda.find({ eventId }).sort({ orderNo: 1 });
    return res.status(200).json({ success: true, message: 'Sessions fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/session-agendas/:id
const getSingleSessionAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session agenda id' });
    }
    const item = await SessionAgenda.findById(id).populate('eventId');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Session agenda not found' });
    }
    return res.status(200).json({ success: true, message: 'Session agenda fetched', data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/session-agendas/:id
const updateSessionAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session agenda id' });
    }

    const { error, value } = updateSessionAgendaSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details[0].context && error.details[0].context.message
        ? error.details[0].context.message
        : error.details[0].message;
      return res.status(400).json({ success: false, message: msg });
    }

    const updated = await SessionAgenda.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).populate('eventId');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Session agenda not found' });
    }
    return res.status(200).json({ success: true, message: 'Session agenda updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/session-agendas/:id
const deleteSessionAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session agenda id' });
    }
    const deleted = await SessionAgenda.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Session agenda not found' });
    }
    return res.status(200).json({ success: true, message: 'Session agenda deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSessionAgenda,
  getAllSessionAgendas,
  getSessionsByEvent,
  getSingleSessionAgenda,
  updateSessionAgenda,
  deleteSessionAgenda,
};
