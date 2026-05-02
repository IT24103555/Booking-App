export const normalizeCardNumber = (value) => String(value || '').replace(/\D/g, '');

export const formatCardNumber = (value) => {
  const digits = normalizeCardNumber(value);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const detectCardBrand = (value) => {
  const digits = normalizeCardNumber(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Unknown';
};

export const isValidCardholderName = (value) => {
  const name = String(value || '').trim();
  return /^[A-Za-z][A-Za-z'\-\. ]{1,68}[A-Za-z]$/.test(name);
};

export const isValidExpiryMonth = (value) => /^(0[1-9]|1[0-2])$/.test(String(value || '').trim());

export const isValidExpiryYear = (value) => {
  const yearValue = String(value || '').trim();
  if (!/^\d{4}$/.test(yearValue)) return false;
  const currentYear = new Date().getFullYear();
  return Number(yearValue) >= currentYear;
};

export const isCardExpired = (month, year) => {
  if (!isValidExpiryMonth(month) || !isValidExpiryYear(year)) return true;

  const monthNumber = Number(String(month).trim());
  const yearNumber = Number(String(year).trim());
  const today = new Date();

  if (yearNumber > today.getFullYear()) return false;
  if (yearNumber < today.getFullYear()) return true;

  return monthNumber < today.getMonth() + 1;
};

export const isLuhnValid = (value) => {
  const digits = normalizeCardNumber(value);
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

export const isValidCvv = (value, cardBrand) => {
  const cvv = String(value || '').replace(/\D/g, '');
  if (cardBrand === 'American Express') return /^\d{4}$/.test(cvv);
  return /^\d{3}$/.test(cvv);
};

export const maskCardNumber = (value) => {
  const digits = normalizeCardNumber(value);
  const last4 = digits.slice(-4);
  return last4 ? `**** **** **** ${last4}` : '**** **** **** ****';
};
