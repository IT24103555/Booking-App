const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

const luhnCheck = (value) => {
  const digits = normalizeDigits(value);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const getCardBrand = (value) => {
  const digits = normalizeDigits(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^(6011|65)/.test(digits)) return 'Discover';
  return 'Card';
};

const isFutureExpiry = (month, year) => {
  const monthValue = String(month || '').trim();
  const yearValue = String(year || '').trim();
  if (!/^(0[1-9]|1[0-2])$/.test(monthValue)) return false;
  if (!/^(\d{2}|\d{4})$/.test(yearValue)) return false;

  const monthNumber = Number(monthValue);
  const fullYear = yearValue.length === 2 ? Number(`20${yearValue}`) : Number(yearValue);
  const expiryDate = new Date(fullYear, monthNumber, 0, 23, 59, 59, 999);
  return expiryDate >= new Date();
};

const cardPaymentDetailsSchema = Joi.object({
  cardHolderName: Joi.string().trim().pattern(/^[A-Za-z][A-Za-z'\-\. ]{1,68}[A-Za-z]$/).required().messages({
    'any.required': 'Cardholder name is required',
    'string.empty': 'Cardholder name is required',
    'string.pattern.base': 'Cardholder name must use letters and common punctuation only',
  }),
  cardNumber: Joi.string().custom((value, helpers) => {
    if (!/^\d{13,19}$/.test(value)) {
      return helpers.error('card.number');
    }
    if (!luhnCheck(value)) {
      return helpers.error('card.luhn');
    }
    return value;
  }).required().messages({
    'any.required': 'Card number is required',
    'card.number': 'Card number must contain 13 to 19 digits',
    'card.luhn': 'Card number is invalid',
  }),
  expiryMonth: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required().messages({
    'any.required': 'Expiry month is required',
    'string.pattern.base': 'Expiry month must be between 01 and 12',
  }),
  expiryYear: Joi.string().pattern(/^(\d{2}|\d{4})$/).custom((value, helpers) => {
    const { expiryMonth } = helpers.state.ancestors[0] || {};
    if (!isFutureExpiry(expiryMonth, value)) {
      return helpers.error('card.expired');
    }
    return value;
  }).required().messages({
    'any.required': 'Expiry year is required',
    'string.pattern.base': 'Expiry year must be 2 or 4 digits',
    'card.expired': 'Card has expired',
  }),
  cvv: Joi.string().custom((value, helpers) => {
    const cardNumber = helpers.state.ancestors[0]?.cardNumber;
    const brand = getCardBrand(cardNumber);
    if (brand === 'American Express' && !/^\d{4}$/.test(value)) {
      return helpers.error('card.cvv');
    }
    if (brand !== 'American Express' && !/^\d{3}$/.test(value)) {
      return helpers.error('card.cvv');
    }
    return value;
  }).required().messages({
    'any.required': 'CVV is required',
    'card.cvv': 'CVV is invalid for the selected card',
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
