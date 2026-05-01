const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const createBookingSchema = Joi.object({
  eventId: objectId.required().messages({
    'any.required': 'Event is required',
    'string.pattern.base': 'Event must be a valid id',
  }),
  ticketTypeId: objectId.required().messages({
    'any.required': 'Ticket type is required',
    'string.pattern.base': 'Ticket type must be a valid id',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be greater than 0',
  }),
});

const updateBookingSchema = Joi.object({
  quantity: Joi.number().integer().min(1),
  status: Joi.string().valid('Pending', 'Confirmed', 'Cancelled'),
});

module.exports = { createBookingSchema, updateBookingSchema };
