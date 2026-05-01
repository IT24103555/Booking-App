const Joi = require('joi');

const createTicketTypeSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is required',
  }),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be greater than or equal to 0',
    'any.required': 'Price is required',
  }),
  totalQuantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Total quantity must be greater than 0',
    'any.required': 'Total quantity is required',
  }),
  availableQuantity: Joi.number().integer().min(0).required().messages({
    'any.required': 'Available quantity is required',
  }),
  status: Joi.string().valid('Active', 'Inactive').default('Active').messages({
    'any.only': 'Status must be Active or Inactive',
  }),
}).custom((value, helpers) => {
  if (value.availableQuantity > value.totalQuantity) {
    return helpers.error('any.custom', {
      message: 'Available quantity cannot be greater than total quantity',
    });
  }
  return value;
}, 'AvailableQuantity <= TotalQuantity');

const updateTicketTypeSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0),
  totalQuantity: Joi.number().integer().min(1),
  availableQuantity: Joi.number().integer().min(0),
  status: Joi.string().valid('Active', 'Inactive'),
}).custom((value, helpers) => {
  if (
    value.totalQuantity !== undefined &&
    value.availableQuantity !== undefined &&
    value.availableQuantity > value.totalQuantity
  ) {
    return helpers.error('any.custom', {
      message: 'Available quantity cannot be greater than total quantity',
    });
  }
  return value;
}, 'AvailableQuantity <= TotalQuantity');

module.exports = { createTicketTypeSchema, updateTicketTypeSchema };
