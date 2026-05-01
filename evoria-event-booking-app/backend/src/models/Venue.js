const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
