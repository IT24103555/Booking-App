const User = require('../models/User');
const validateObjectId = require('../utils/validateObjectId');

// Beginner-friendly, shared validation rules for names and phone numbers.
const profileNameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/;

const validateName = (name) => {
  const value = String(name || '').trim();
  if (!value) return 'Name is required.';
  if (value.length < 2) return 'Name must be at least 2 characters.';
  if (value.length > 60) return 'Name must be at most 60 characters.';
  if (!profileNameRegex.test(value)) {
    return 'Name can contain only letters, spaces, dots, apostrophes, and hyphens.';
  }
  return '';
};

const validatePhone = (phone) => {
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
};

const isForbiddenProfileFieldPresent = (body) => {
  const allowed = new Set(['name', 'phone']);
  return Object.keys(body || {}).some((key) => !allowed.has(key));
};

// GET /api/users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Users fetched', data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me
const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, message: 'Profile fetched', data: req.user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    if (isForbiddenProfileFieldPresent(req.body)) {
      return res.status(400).json({ success: false, message: 'You can only update name and phone from profile settings.' });
    }

    const name = String(req.body?.name || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);

    if (nameError) {
      return res.status(400).json({ success: false, message: nameError });
    }
    if (phoneError) {
      return res.status(400).json({ success: false, message: phoneError });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone: phone || null },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id (admin only)
const getSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'User fetched', data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
// Kept for compatibility, but admin profile editing is not allowed.
const updateUser = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Admins cannot edit user profile details. Users must update their own profile.',
  });
};

// PATCH /api/users/:id/status (admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    if (typeof req.body?.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(target._id) === String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You cannot change your own account status.' });
    }

    if (target.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts are protected from status changes.' });
    }

    target.isActive = req.body.isActive;
    await target.save();

    const updated = await User.findById(target._id).select('-password');

    return res.status(200).json({ success: true, message: 'User status updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(target._id) === String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own account.' });
    }

    if (target.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted by another admin.' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getProfile,
  updateProfile,
  getSingleUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};
