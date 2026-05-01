const jwt = require('jsonwebtoken');

// Creates a signed JWT token for a user
// We store only minimal info in the token (user id + role)
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing. Add it to your .env file.');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
