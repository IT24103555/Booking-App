const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const toLocalDate = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isValidDateInput = (value) => {
  if (!dateRegex.test(value)) return false;
  const date = toLocalDate(value);
  if (!date) return false;
  const [year, month, day] = String(value).split('-').map(Number);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const dateOnlyString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (value) => {
  const [hours, minutes] = String(value).split(':').map(Number);
  return (hours * 60) + minutes;
};

const createEventSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required',
  }),
  category: Joi.string().allow('', null),
  eventDate: Joi.string().trim().pattern(dateRegex).required().messages({
    'any.required': 'Event date is required',
    'string.empty': 'Event date is required',
    'string.pattern.base': 'Event date must be in YYYY-MM-DD format',
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
  if (!isValidDateInput(value.eventDate)) {
    return helpers.error('any.custom', { message: 'Event date must be a valid date in YYYY-MM-DD format' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = toLocalDate(value.eventDate);
  if (!eventDate) {
    return helpers.error('any.custom', { message: 'Event date must be a valid date in YYYY-MM-DD format' });
  }

  if (dateOnlyString(eventDate) < dateOnlyString(today)) {
    return helpers.error('any.custom', { message: 'Event date cannot be in the past' });
  }

  if (timeToMinutes(value.endTime) <= timeToMinutes(value.startTime)) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }

  return value;
}, 'Date + time validations');

const updateEventSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string(),
  category: Joi.string().allow('', null),
  eventDate: Joi.string().trim().pattern(dateRegex).messages({
    'string.pattern.base': 'Event date must be in YYYY-MM-DD format',
  }),
  startTime: Joi.string().pattern(timeRegex),
  endTime: Joi.string().pattern(timeRegex),
  venueId: Joi.string(),
  ticketTypeIds: Joi.array().items(Joi.string()),
  image: Joi.string().allow('', null),
  status: Joi.string().valid('Draft', 'Published', 'Cancelled', 'Completed'),
}).custom((value, helpers) => {
  if (value.startTime && value.endTime && timeToMinutes(value.endTime) <= timeToMinutes(value.startTime)) {
    return helpers.error('any.custom', { message: 'End time must be after start time' });
  }
  if (value.eventDate) {
    if (!isValidDateInput(value.eventDate)) {
      return helpers.error('any.custom', { message: 'Event date must be a valid date in YYYY-MM-DD format' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = toLocalDate(value.eventDate);
    if (!eventDate) {
      return helpers.error('any.custom', { message: 'Event date must be a valid date in YYYY-MM-DD format' });
    }
    if (dateOnlyString(eventDate) < dateOnlyString(today)) {
      return helpers.error('any.custom', { message: 'Event date cannot be in the past' });
    }
  }
  return value;
}, 'Update date + time validations');

module.exports = { createEventSchema, updateEventSchema };
