const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { registerSchema, loginSchema } = require('../validations/authValidation');

// POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const existing = await User.findOne({ email: value.email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Security: only allow creating an admin account when a valid adminKey is provided.
    // Otherwise, force role to customer.
    const desiredRole = value.role || 'customer';
    if (desiredRole === 'admin') {
      const configuredKey = process.env.ADMIN_REGISTER_KEY;
      if (!configuredKey) {
        return res.status(403).json({
          success: false,
          message: 'Admin registration is disabled (missing server key)',
        });
      }
      if (!value.adminKey || String(value.adminKey).trim() !== String(configuredKey).trim()) {
        return res.status(403).json({ success: false, message: 'Invalid admin registration key' });
      }
    }

    const payload = {
      name: value.name,
      email: value.email,
      password: value.password,
      phone: value.phone,
      role: desiredRole === 'admin' ? 'admin' : 'customer',
    };

    const user = await User.create(payload);

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findOne({ email: value.email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }

    const isMatch = await user.matchPassword(value.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMyProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile fetched',
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
};
