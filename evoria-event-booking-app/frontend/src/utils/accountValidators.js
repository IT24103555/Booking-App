const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/;

export function validateName(name) {
  const value = String(name || '').trim();

  if (!value) return 'Name is required.';
  if (value.length < 2) return 'Name must be at least 2 characters.';
  if (value.length > 60) return 'Name must be at most 60 characters.';
  if (!nameRegex.test(value)) {
    return 'Name can contain only letters, spaces, dots, apostrophes, and hyphens.';
  }

  return '';
}

export function validatePhone(phone) {
  const value = String(phone || '').trim();

  if (!value) return '';

  if (value.includes('+') && !value.startsWith('+')) {
    return 'Phone number can only use + at the beginning.';
  }

  const digits = value.startsWith('+') ? value.slice(1) : value;

  if (!/^\d+$/.test(digits)) {
    return 'Phone number can contain only digits and an optional + at the beginning.';
  }

  if (digits.length < 7 || digits.length > 15) {
    return 'Phone number must contain 7 to 15 digits.';
  }

  return '';
}

export function validateProfileForm(values = {}) {
  const errors = {};
  const nameError = validateName(values.name);
  const phoneError = validatePhone(values.phone);

  if (nameError) errors.name = nameError;
  if (phoneError) errors.phone = phoneError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}