const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: '' },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    ticketTypeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TicketType' }],
    image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
