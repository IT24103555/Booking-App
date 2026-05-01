const Joi = require('joi');

const createVenueSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is required',
  }),
  location: Joi.string().trim().required().messages({
    'any.required': 'Location is required',
    'string.empty': 'Location is required',
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Capacity must be greater than 0',
    'any.required': 'Capacity is required',
  }),
  description: Joi.string().trim().allow('', null),
  image: Joi.string().allow('', null),
  status: Joi.string().valid('Available', 'Unavailable').default('Available').messages({
    'any.only': 'Status must be Available or Unavailable',
  }),
});

const updateVenueSchema = Joi.object({
  name: Joi.string().trim(),
  location: Joi.string().trim(),
  capacity: Joi.number().integer().min(1),
  description: Joi.string().trim(),
  image: Joi.string().allow('', null),
  status: Joi.string().valid('Available', 'Unavailable'),
});

module.exports = { createVenueSchema, updateVenueSchema };
