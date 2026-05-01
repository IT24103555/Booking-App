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
