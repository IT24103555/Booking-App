// Small helpers to keep API responses consistent
// You can still send custom JSON directly when needed.

const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const failure = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  success,
  failure,
};
