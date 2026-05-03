// Advanced password validation for professional mobile app standards
// Requirements: uppercase + lowercase + number + minimum length

export function validatePassword(password) {
  const value = String(password || '').trim();

  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (value.length > 128) return 'Password must be at most 128 characters.';

  // Check for uppercase letter
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }

  // Check for number
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number (0-9).';
  }

  return '';
}

export function validateEmail(email) {
  const value = String(email || '').trim();

  if (!value) return 'Email is required.';

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export function validatePasswordConfirm(password, confirmPassword) {
  const pwd = String(password || '').trim();
  const confirmPwd = String(confirmPassword || '').trim();

  if (!confirmPwd) return 'Please confirm your password.';
  if (pwd !== confirmPwd) return 'Passwords do not match.';

  return '';
}

export function validateRegistrationForm(values = {}) {
  const errors = {};

  // Validate name
  if (!values.name) {
    errors.name = 'Name is required.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (values.name.trim().length > 60) {
    errors.name = 'Name must be at most 60 characters.';
  } else {
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/;
    if (!nameRegex.test(values.name.trim())) {
      errors.name = 'Name can contain only letters, spaces, dots, apostrophes, and hyphens.';
    }
  }

  // Validate email
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  // Validate password
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  // Validate password confirmation
  const confirmError = validatePasswordConfirm(values.password, values.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  // Validate phone (optional)
  if (values.phone) {
    const phone = String(values.phone).trim();
    if (phone) {
      if (phone.includes('+') && !phone.startsWith('+')) {
        errors.phone = 'Phone number can only use + at the beginning.';
      } else {
        const digits = phone.startsWith('+') ? phone.slice(1) : phone;
        if (!/^\d+$/.test(digits)) {
          errors.phone = 'Phone number can contain only digits and an optional + at the beginning.';
        } else if (digits.length < 7 || digits.length > 15) {
          errors.phone = 'Phone number must contain 7 to 15 digits.';
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAdminForm(values = {}) {
  // Validate registration fields
  const regErrors = validateRegistrationForm(values);

  const errors = regErrors.errors;

  // Validate admin key (additional field)
  if (!values.adminKey) {
    errors.adminKey = 'Admin key is required.';
  } else if (String(values.adminKey).trim().length < 6) {
    errors.adminKey = 'Admin key must be at least 6 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginForm(values = {}) {
  const errors = {};

  // Validate email
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  // Validate password (basic check for login)
  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Helper to get password strength indicator
export function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '#CCCCCC' };

  let strength = 0;
  const checks = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    isLongEnough: password.length >= 8,
    isVeryLong: password.length >= 12,
  };

  Object.values(checks).forEach((check) => {
    if (check) strength += 1;
  });

  if (strength <= 1) {
    return { level: 1, label: 'Weak', color: '#EF4444', checks };
  } else if (strength <= 3) {
    return { level: 2, label: 'Fair', color: '#F97316', checks };
  } else if (strength <= 4) {
    return { level: 3, label: 'Good', color: '#EAB308', checks };
  } else {
    return { level: 4, label: 'Strong', color: '#22C55E', checks };
  }
}
