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

export const isTimeHHmm = (value) => {
  const t = String(value || '').trim();
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
};

export const isDateYYYYMMDD = (value) => {
  const dateValue = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return false;

  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const isTodayOrFutureDate = (value) => {
  if (!isDateYYYYMMDD(value)) return false;

  const [year, month, day] = String(value).trim().split('-').map(Number);
  const eventDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate >= today;
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
