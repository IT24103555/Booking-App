const mongoose = require('mongoose');

const sessionAgendaSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true, trim: true },
    speakerName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    orderNo: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  },
  { timestamps: true }
);

sessionAgendaSchema.index({ eventId: 1, orderNo: 1 });

module.exports = mongoose.model('SessionAgenda', sessionAgendaSchema);
