// Simple validation helpers for screens

export const isRequired = (value) => {
  return value !== undefined && value !== null && String(value).trim().length > 0;
};

export const isEmail = (value) => {
  const email = String(value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const minLength = (value, len) => {
  return String(value || '').length >= len;
};

export const isPositiveInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

export const isNonNegativeNumber = (value) => {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 0;
};

export const isValidDateFormat = (date) => {
  const value = String(date || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const isRealCalendarDate = (date) => {
  const value = String(date || '').trim();
  if (!isValidDateFormat(value)) return false;

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  // Build the date in UTC so the calendar check does not shift by timezone.
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
};

const parseDateParts = (date) => {
  if (!isRealCalendarDate(date)) return null;
  const [yearText, monthText, dayText] = String(date).trim().split('-');
  return {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
  };
};

const getLocalDateOnly = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const isPastDate = (date) => {
  const parts = parseDateParts(date);
  if (!parts) return false;

  const inputDate = new Date(parts.year, parts.month - 1, parts.day);
  const today = getLocalDateOnly();
  return inputDate < today;
};

export const isTooFarFutureDate = (date, maxYears = 2) => {
  const parts = parseDateParts(date);
  if (!parts) return false;

  const inputDate = new Date(parts.year, parts.month - 1, parts.day);
  const today = getLocalDateOnly();
  const maxDate = new Date(today.getFullYear() + maxYears, today.getMonth(), today.getDate());
  return inputDate > maxDate;
};

export const isTimeHHmm = (value) => {
  const time = String(value || '').trim();
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

export const convertTimeToMinutes = (time) => {
  if (!isTimeHHmm(time)) return NaN;
  const [hoursText, minutesText] = String(time).trim().split(':');
  return Number(hoursText) * 60 + Number(minutesText);
};

export const isEndTimeAfterStartTime = (startTime, endTime) => {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) return false;
  return endMinutes > startMinutes;
};

export const getEventDurationMinutes = (startTime, endTime) => {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) return NaN;
  return endMinutes - startMinutes;
};

export const isStartTimePastForToday = (eventDate, startTime) => {
  if (!isRealCalendarDate(eventDate) || !isTimeHHmm(startTime)) return false;

  const parts = parseDateParts(eventDate);
  if (!parts) return false;

  const today = getLocalDateOnly();
  const inputDate = new Date(parts.year, parts.month - 1, parts.day);
  if (inputDate.getTime() !== today.getTime()) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = convertTimeToMinutes(startTime);
  return startMinutes < currentMinutes;
};

export const validateEventSchedule = (eventDate, startTime, endTime) => {
  const dateValue = String(eventDate || '').trim();
  const startValue = String(startTime || '').trim();
  const endValue = String(endTime || '').trim();

  if (!dateValue) return { valid: false, message: 'Event date is required.' };
  if (!isValidDateFormat(dateValue)) return { valid: false, message: 'Event date must be in YYYY-MM-DD format.' };
  if (!isRealCalendarDate(dateValue)) return { valid: false, message: 'Please enter a valid calendar date.' };
  if (isPastDate(dateValue)) return { valid: false, message: 'Event date cannot be in the past.' };
  if (isTooFarFutureDate(dateValue, 2)) return { valid: false, message: 'Event date cannot be more than 2 years in the future.' };

  if (!startValue) return { valid: false, message: 'Start time is required.' };
  if (!isTimeHHmm(startValue)) return { valid: false, message: 'Start time must be in HH:mm format.' };
  if (isStartTimePastForToday(dateValue, startValue)) {
    return { valid: false, message: "Start time cannot be in the past for today's event." };
  }

  if (!endValue) return { valid: false, message: 'End time is required.' };
  if (!isTimeHHmm(endValue)) return { valid: false, message: 'End time must be in HH:mm format.' };
  if (!isEndTimeAfterStartTime(startValue, endValue)) return { valid: false, message: 'End time must be after start time.' };

  const durationMinutes = getEventDurationMinutes(startValue, endValue);
  if (Number.isNaN(durationMinutes)) return { valid: false, message: 'Please enter a valid event schedule.' };
  if (durationMinutes < 15) return { valid: false, message: 'Event duration must be at least 15 minutes.' };
  if (durationMinutes > 12 * 60) return { valid: false, message: 'Event duration cannot exceed 12 hours.' };

  return { valid: true, message: '' };
};

export const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

export const isCardHolderName = (value) => {
  const name = String(value || '').trim();
  return /^[A-Za-z][A-Za-z'\-\. ]{1,68}[A-Za-z]$/.test(name);
};

export const isLuhnValid = (value) => {
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

export const getCardBrand = (value) => {
  const digits = normalizeDigits(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^(6011|65)/.test(digits)) return 'Discover';
  return 'Card';
};

export const isCardExpiryValid = (month, year) => {
  const monthValue = String(month || '').trim();
  const yearValue = String(year || '').trim();
  if (!/^(0[1-9]|1[0-2])$/.test(monthValue)) return false;
  if (!/^(\d{2}|\d{4})$/.test(yearValue)) return false;

  const monthNumber = Number(monthValue);
  const fullYear = yearValue.length === 2 ? Number(`20${yearValue}`) : Number(yearValue);
  const expiryDate = new Date(fullYear, monthNumber, 0, 23, 59, 59, 999);
  return expiryDate >= new Date();
};

export const isCvvValid = (value, cardNumber) => {
  const cvv = normalizeDigits(value);
  const brand = getCardBrand(cardNumber);
  if (brand === 'American Express') return /^\d{4}$/.test(cvv);
  return /^\d{3}$/.test(cvv);
};

export const isMobileMoneyPhone = (value) => {
  const phone = String(value || '').trim();
  return /^\+?[0-9]{7,15}$/.test(phone);
};
