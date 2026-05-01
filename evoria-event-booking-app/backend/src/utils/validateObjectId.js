const mongoose = require('mongoose');

// Validates MongoDB ObjectId strings before hitting the database
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = validateObjectId;
