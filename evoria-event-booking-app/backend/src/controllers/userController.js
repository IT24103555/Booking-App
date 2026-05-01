const User = require('../models/User');
const validateObjectId = require('../utils/validateObjectId');
const Joi = require('joi');

// Validation for user update by admin
const adminUpdateUserSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  phone: Joi.string().allow('', null).pattern(/^[+0-9\s-]{7,20}$/).messages({
    'string.pattern.base': 'Phone must be valid if provided',
  }),
  role: Joi.string().valid('admin', 'organizer', 'customer'),
  isActive: Joi.boolean(),
});

// Validation for self profile update
const selfUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  phone: Joi.string().allow('', null).pattern(/^[+0-9\s-]{7,20}$/).messages({
    'string.pattern.base': 'Phone must be valid if provided',
  }),
});

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
    const { error, value } = selfUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updated = await User.findByIdAndUpdate(req.user._id, value, {
      new: true,
      runValidators: true,
    }).select('-password');

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

// PUT /api/users/:id (admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const { error, value } = adminUpdateUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updated = await User.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User updated', data: updated });
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

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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
  deleteUser,
};
