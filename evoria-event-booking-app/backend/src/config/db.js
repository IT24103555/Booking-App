const mongoose = require('mongoose');

// Connect to MongoDB using Mongoose
// This function is called once from server.js when the app starts.
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing. Add it to your .env file.');
    }

    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
