const TicketType = require('../models/TicketType');
const validateObjectId = require('../utils/validateObjectId');
const { createTicketTypeSchema, updateTicketTypeSchema } = require('../validations/ticketTypeValidation');

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

    const created = await TicketType.create(value);
    return res.status(201).json({ success: true, message: 'Ticket type created', data: created });
  } catch (err) {
    next(err);
  }
};

// GET /api/ticket-types
const getAllTicketTypes = async (req, res, next) => {
  try {
    const items = await TicketType.find().sort({ createdAt: -1 });
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
    const item = await TicketType.findById(id);
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

    const updated = await TicketType.findByIdAndUpdate(id, value, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
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
    const deleted = await TicketType.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
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
