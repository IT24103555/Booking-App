const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm

const createSessionAgendaSchema = Joi.object({
  eventId: Joi.string().required().messages({
    'any.required': 'Event is required',
  }),
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
  }),
  speakerName: Joi.string().trim().required().messages({
    'any.required': 'Speaker name is required',
    'string.empty': 'Speaker name is required',
  }),
  description: Joi.string().allow('', null),
  startTime: Joi.string().pattern(timeRegex).required().messages({
    'any.required': 'Start time is required',
    'string.pattern.base': 'Start time must be in HH:mm format',
  }),
  endTime: Joi.string().pattern(timeRegex).required().messages({
    'any.required': 'End time is required',
    'string.pattern.base': 'End time must be in HH:mm format',
  }),
  orderNo: Joi.number().integer().min(1).required().messages({
    'any.required': 'Order number is required',
    'number.min': 'Order number must be a positive number',
  }),
  status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled').default('Scheduled').messages({
    'any.only': 'Status must be Scheduled, Completed, or Cancelled',
  }),
}).custom((value, helpers) => {
  if (value.endTime <= value.startTime) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }
  return value;
}, 'Time validation');

const updateSessionAgendaSchema = Joi.object({
  title: Joi.string().trim(),
  speakerName: Joi.string().trim(),
  description: Joi.string().allow('', null),
  startTime: Joi.string().pattern(timeRegex),
  endTime: Joi.string().pattern(timeRegex),
  orderNo: Joi.number().integer().min(1),
  status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled'),
}).custom((value, helpers) => {
  if (value.startTime && value.endTime && value.endTime <= value.startTime) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }
  return value;
}, 'Time validation');

module.exports = { createSessionAgendaSchema, updateSessionAgendaSchema };
