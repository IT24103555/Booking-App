const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const isFutureExpiry = (month, year) => {
  const monthValue = String(month || '').trim();
  const yearValue = String(year || '').trim();
  if (!/^(0[1-9]|1[0-2])$/.test(monthValue)) return false;
  if (!/^\d{4}$/.test(yearValue)) return false;

  const monthNumber = Number(monthValue);
  const yearNumber = Number(yearValue);
  const currentYear = new Date().getFullYear();

  if (yearNumber > currentYear) return true;
  if (yearNumber < currentYear) return false;

  return monthNumber >= new Date().getMonth() + 1;
};

const cardPaymentDetailsSchema = Joi.object({
  cardBrand: Joi.string().valid('Visa', 'Mastercard', 'American Express', 'Unknown').required().messages({
    'any.required': 'Card brand is required',
    'any.only': 'Card brand must be Visa, Mastercard, American Express, or Unknown',
  }),
  last4: Joi.string().pattern(/^\d{4}$/).required().messages({
    'any.required': 'Card last 4 digits are required',
    'string.pattern.base': 'Card last 4 digits must contain exactly 4 digits',
  }),
  expiryMonth: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required().messages({
    'any.required': 'Expiry month is required',
    'string.pattern.base': 'Expiry month must be between 01 and 12',
  }),
  expiryYear: Joi.string().pattern(/^\d{4}$/).custom((value, helpers) => {
    const { expiryMonth } = helpers.state.ancestors[0] || {};
    if (!isFutureExpiry(expiryMonth, value)) {
      return helpers.error('card.expired');
    }
    return value;
  }).required().messages({
    'any.required': 'Expiry year is required',
    'string.pattern.base': 'Expiry year must be 4 digits',
    'card.expired': 'Card has expired',
  }),
});

const mobileMoneyPaymentDetailsSchema = Joi.object({
  provider: Joi.string().trim().min(2).max(32).required().messages({
    'any.required': 'Mobile money provider is required',
    'string.empty': 'Mobile money provider is required',
    'string.min': 'Mobile money provider is required',
  }),
  phoneNumber: Joi.string().pattern(/^\+?[0-9]{7,15}$/).required().messages({
    'any.required': 'Mobile money phone number is required',
    'string.pattern.base': 'Phone number must contain 7 to 15 digits',
  }),
});

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
  paymentMethod: Joi.string().valid('Pay at Venue', 'Card', 'Mobile Money').required().messages({
    'any.required': 'Payment method is required',
    'any.only': 'Payment method must be Pay at Venue, Card, or Mobile Money',
  }),
  paymentDetails: Joi.alternatives().conditional('paymentMethod', {
    switch: [
      { is: 'Card', then: cardPaymentDetailsSchema.required() },
      { is: 'Mobile Money', then: mobileMoneyPaymentDetailsSchema.required() },
      { is: 'Pay at Venue', then: Joi.forbidden() },
    ],
    otherwise: Joi.forbidden(),
  }),
});

const updateBookingSchema = Joi.object({
  quantity: Joi.number().integer().min(1),
  status: Joi.string().valid('Pending', 'Confirmed', 'Cancelled'),
  paymentMethod: Joi.string().valid('Pay at Venue', 'Card', 'Mobile Money'),
  paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed'),
});

module.exports = { createBookingSchema, updateBookingSchema };
