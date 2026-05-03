const Joi = require('joi');

// Advanced password validation: must contain uppercase, lowercase, number, min 8 chars
const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Valid email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(passwordPattern)
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase letter (A-Z), lowercase letter (a-z), and number (0-9)',
    }),
  phone: Joi.string().allow('', null).pattern(/^[+0-9\s-]{7,20}$/).messages({
    'string.pattern.base': 'Phone must be valid if provided',
  }),
  // By default, everyone registers as a customer.
  // Admin registration is allowed only when a valid adminKey is provided.
  role: Joi.string().valid('customer', 'admin').default('customer').messages({
    'any.only': 'Role must be customer or admin',
  }),
  adminKey: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Valid email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

module.exports = { registerSchema, loginSchema, passwordPattern };
