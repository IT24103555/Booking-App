const Event = require('../models/Event');
const Venue = require('../models/Venue');
const TicketType = require('../models/TicketType');
const validateObjectId = require('../utils/validateObjectId');
const { createEventSchema, updateEventSchema } = require('../validations/eventValidation');
const { resolveStoredImagePath } = require('../middleware/uploadMiddleware');

// POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.image = await resolveStoredImagePath(req.file);
    } else if (body.image && typeof body.image !== 'string') {
      delete body.image;
    }

    const { error, value } = createEventSchema.validate(body, { abortEarly: false });
    if (error) {
      const msg = error.details[0].context && error.details[0].context.message
        ? error.details[0].context.message
        : error.details[0].message;
      return res.status(400).json({ success: false, message: msg });
    }

    // Check venue exists
    if (!validateObjectId(value.venueId)) {
      return res.status(400).json({ success: false, message: 'Invalid venueId' });
    }
    const venue = await Venue.findById(value.venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Check ticket types exist
    for (const tId of value.ticketTypeIds || []) {
      if (!validateObjectId(tId)) {
        return res.status(400).json({ success: false, message: 'Invalid ticketTypeIds value' });
      }
    }
    if (value.ticketTypeIds && value.ticketTypeIds.length > 0) {
      const count = await TicketType.countDocuments({ _id: { $in: value.ticketTypeIds } });
      if (count !== value.ticketTypeIds.length) {
        return res.status(400).json({ success: false, message: 'One or more ticket types not found' });
      }
    }

    const created = await Event.create(value);
    const populated = await Event.findById(created._id)
      .populate('venueId')
      .populate('ticketTypeIds');

    return res.status(201).json({ success: true, message: 'Event created', data: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/events
const getAllEvents = async (req, res, next) => {
  try {
    const items = await Event.find()
      .populate('venueId')
      .populate('ticketTypeIds')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Events fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id
const getSingleEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }
    const item = await Event.findById(id).populate('venueId').populate('ticketTypeIds');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, message: 'Event fetched', data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const body = { ...req.body };
    if (req.file) {
      body.image = await resolveStoredImagePath(req.file);
    } else if (body.image && typeof body.image !== 'string') {
      delete body.image;
    }

    const { error, value } = updateEventSchema.validate(body, { abortEarly: false });
    if (error) {
      const msg = error.details[0].context && error.details[0].context.message
        ? error.details[0].context.message
        : error.details[0].message;
      return res.status(400).json({ success: false, message: msg });
    }

    if (value.venueId) {
      if (!validateObjectId(value.venueId)) {
        return res.status(400).json({ success: false, message: 'Invalid venueId' });
      }
      const venue = await Venue.findById(value.venueId);
      if (!venue) {
        return res.status(404).json({ success: false, message: 'Venue not found' });
      }
    }
    if (value.ticketTypeIds) {
      for (const tId of value.ticketTypeIds) {
        if (!validateObjectId(tId)) {
          return res.status(400).json({ success: false, message: 'Invalid ticketTypeIds value' });
        }
      }
      if (value.ticketTypeIds.length > 0) {
        const count = await TicketType.countDocuments({ _id: { $in: value.ticketTypeIds } });
        if (count !== value.ticketTypeIds.length) {
          return res.status(400).json({ success: false, message: 'One or more ticket types not found' });
        }
      }
    }


    const updated = await Event.findByIdAndUpdate(id, value, { new: true, runValidators: true })
      .populate('venueId')
      .populate('ticketTypeIds');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, message: 'Event updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
