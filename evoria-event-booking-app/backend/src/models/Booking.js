const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['Pay at Venue', 'Card', 'Mobile Money'], default: 'Pay at Venue' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    paymentReference: { type: String, default: '' },
    paymentCompletedAt: { type: Date },
    paymentDetails: {
      cardHolderName: { type: String, default: '' },
      cardBrand: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
      cardMaskedNumber: { type: String, default: '' },
      expiryMonth: { type: String, default: '' },
      expiryYear: { type: String, default: '' },
      provider: { type: String, default: '' },
      phoneNumber: { type: String, default: '' },
      transactionStatus: { type: String, default: '' },
    },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, eventId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
