const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm

const createEventSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required',
  }),
  // Category should be one of the supported category ids used by the frontend
  category: Joi.string().valid('', 'music', 'education', 'tech', 'sports').default(''),
  eventDate: Joi.date().required().messages({
    'any.required': 'Event date is required',
  }),
  startTime: Joi.string().pattern(timeRegex).required().messages({
    'any.required': 'Start time is required',
    'string.pattern.base': 'Start time must be in HH:mm format',
  }),
  endTime: Joi.string().pattern(timeRegex).required().messages({
    'any.required': 'End time is required',
    'string.pattern.base': 'End time must be in HH:mm format',
  }),
  venueId: Joi.string().required().messages({
    'any.required': 'Venue is required',
  }),
  ticketTypeIds: Joi.array().items(Joi.string()).default([]),
  image: Joi.string().allow('', null),
  status: Joi.string().valid('Draft', 'Published', 'Cancelled', 'Completed').default('Draft').messages({
    'any.only': 'Status must be Draft, Published, Cancelled, or Completed',
  }),
}).custom((value, helpers) => {
  // Event date cannot be in the past (date-only check)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(value.eventDate);
  eventDate.setHours(0, 0, 0, 0);
  if (eventDate < today) {
    return helpers.error('any.custom', { message: 'Event date cannot be in the past' });
  }

  // endTime must be after startTime (simple string compare works for HH:mm)
  if (value.endTime <= value.startTime) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }

  return value;
}, 'Date + time validations');

const updateEventSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string(),
  category: Joi.string().valid('', 'music', 'education', 'tech', 'sports').default(''),
  eventDate: Joi.date(),
  startTime: Joi.string().pattern(timeRegex),
  endTime: Joi.string().pattern(timeRegex),
  venueId: Joi.string(),
  ticketTypeIds: Joi.array().items(Joi.string()),
  image: Joi.string().allow('', null),
  status: Joi.string().valid('Draft', 'Published', 'Cancelled', 'Completed'),
}).custom((value, helpers) => {
  if (value.startTime && value.endTime && value.endTime <= value.startTime) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }
  if (value.eventDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(value.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      return helpers.error('any.custom', { message: 'Event date cannot be in the past' });
    }
  }
  return value;
}, 'Update date + time validations');

module.exports = { createEventSchema, updateEventSchema };
