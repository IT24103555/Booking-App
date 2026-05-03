const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const validateObjectId = require('../utils/validateObjectId');
const { createTicketTypeSchema, updateTicketTypeSchema } = require('../validations/ticketTypeValidation');
const { notifyUsersByEvent } = require('../services/notificationService');

const syncTicketTypeWithEvent = async (ticketTypeId, oldEventId, newEventId) => {
  if (oldEventId && oldEventId.toString() !== newEventId.toString()) {
    await Event.findByIdAndUpdate(oldEventId, { $pull: { ticketTypeIds: ticketTypeId } });
  }
  await Event.findByIdAndUpdate(newEventId, { $addToSet: { ticketTypeIds: ticketTypeId } });
};

// POST /api/ticket-types
const createTicketType = async (req, res, next) => {
  try {
    const { error, value } = createTicketTypeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details[0].context && error.details[0].context.message
        ? error.details[0].context.message
        : error.details[0].message;
      return res.status(400).json({ success: false, message: msg });
    }

    if (!validateObjectId(value.eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const event = await Event.findById(value.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const created = await TicketType.create(value);
    await Event.findByIdAndUpdate(event._id, { $addToSet: { ticketTypeIds: created._id } });
    const populated = await TicketType.findById(created._id).populate('eventId');
    return res.status(201).json({ success: true, message: 'Ticket type created', data: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/ticket-types
const getAllTicketTypes = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId) {
      if (!validateObjectId(eventId)) {
        return res.status(400).json({ success: false, message: 'Invalid event id' });
      }
      filter.eventId = eventId;
    }
    const items = await TicketType.find(filter).populate('eventId').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Ticket types fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/ticket-types/:id
const getSingleTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type id' });
    }
    const item = await TicketType.findById(id).populate('eventId');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
    }
    return res.status(200).json({ success: true, message: 'Ticket type fetched', data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/ticket-types/:id
const updateTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type id' });
    }

    const { error, value } = updateTicketTypeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const msg = error.details[0].context && error.details[0].context.message
        ? error.details[0].context.message
        : error.details[0].message;
      return res.status(400).json({ success: false, message: msg });
    }

    const current = await TicketType.findById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
    }

    let nextEventId = current.eventId;
    if (value.eventId !== undefined) {
      if (!validateObjectId(value.eventId)) {
        return res.status(400).json({ success: false, message: 'Invalid event id' });
      }
      const nextEvent = await Event.findById(value.eventId);
      if (!nextEvent) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      nextEventId = nextEvent._id;
    }

    const updated = await TicketType.findByIdAndUpdate(
      id,
      { ...value, eventId: nextEventId },
      { new: true, runValidators: true }
    ).populate('eventId');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
    }

    notifyUsersByEvent(updated.eventId?._id || updated.eventId, {
      title: 'Ticket Availability Updated',
      message: 'Ticket availability or pricing has been updated.',
      type: 'ticket',
      priority: 'medium',
      relatedEntityType: 'TicketType',
      relatedEntityId: updated._id,
    }).catch((notifyErr) => console.warn('[updateTicketType] notification failed:', notifyErr.message));

    if (value.eventId !== undefined && current.eventId?.toString() !== nextEventId.toString()) {
      await syncTicketTypeWithEvent(updated._id, current.eventId, nextEventId);
    } else if (!current.eventId) {
      await Event.findByIdAndUpdate(nextEventId, { $addToSet: { ticketTypeIds: updated._id } });
    }

    return res.status(200).json({ success: true, message: 'Ticket type updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/ticket-types/:id
const deleteTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type id' });
    }
    const current = await TicketType.findById(id);
    const deleted = await TicketType.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
    }
    if (deleted.eventId) {
      await Event.findByIdAndUpdate(deleted.eventId, { $pull: { ticketTypeIds: deleted._id } });
      notifyUsersByEvent(deleted.eventId, {
        title: 'Ticket Availability Updated',
        message: 'Ticket availability has changed for one of the event ticket types.',
        type: 'ticket',
        priority: 'medium',
        relatedEntityType: 'TicketType',
        relatedEntityId: current?._id || deleted._id,
      }).catch((notifyErr) => console.warn('[deleteTicketType] notification failed:', notifyErr.message));
    }
    return res.status(200).json({ success: true, message: 'Ticket type deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicketType,
  getAllTicketTypes,
  getSingleTicketType,
  updateTicketType,
  deleteTicketType,
};
