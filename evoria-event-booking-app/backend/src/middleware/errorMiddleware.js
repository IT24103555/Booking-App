// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central error handler
// Any controller can call next(error) and it will be handled here
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // CORS origin rejections should be a 403 (not a generic 500)
  if (err && typeof err.message === 'string' && err.message.startsWith('Not allowed by CORS')) {
    statusCode = 403;
  }

  // Friendly error messages for common Mongoose errors
  let message = err.message || 'Server error';
  if (err.name === 'CastError') {
    message = 'Invalid ID format';
  }
  if (err.code === 11000) {
    message = 'Duplicate field value (already exists)';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Hide stack in production, show in dev for learning/debugging
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
