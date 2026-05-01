const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    totalQuantity: { type: Number, required: true, min: 1 },
    availableQuantity: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketType', ticketTypeSchema);
