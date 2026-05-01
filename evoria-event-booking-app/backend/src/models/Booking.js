const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, eventId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
