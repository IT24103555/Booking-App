const Booking = require('../models/Booking');
const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const validateObjectId = require('../utils/validateObjectId');
const { createBookingSchema, updateBookingSchema } = require('../validations/bookingValidation');

// Helper: adjust ticket availability safely
const decreaseAvailability = async (ticketTypeId, quantity) => {
  // Atomic update to prevent overbooking
  return TicketType.findOneAndUpdate(
    { _id: ticketTypeId, availableQuantity: { $gte: quantity } },
    { $inc: { availableQuantity: -quantity } },
    { new: true }
  );
};

const increaseAvailability = async (ticketTypeId, quantity) => {
  return TicketType.findByIdAndUpdate(
    ticketTypeId,
    { $inc: { availableQuantity: quantity } },
    { new: true }
  );
};

// POST /api/bookings (auth required)
const createBooking = async (req, res, next) => {
  try {
    const { error, value } = createBookingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { eventId, ticketTypeId, quantity, paymentMethod } = value;
    if (!validateObjectId(eventId) || !validateObjectId(ticketTypeId)) {
      return res.status(400).json({ success: false, message: 'Invalid eventId or ticketTypeId' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Ensure the requested ticket type belongs to this event
    const eventTicketTypeIds = (event.ticketTypeIds || []).map((id) => id.toString());
    if (!eventTicketTypeIds.includes(ticketTypeId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Ticket type does not belong to this event',
      });
    }

    const ticketType = await TicketType.findById(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ success: false, message: 'Ticket type not found' });
    }
    if (ticketType.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Ticket type is inactive' });
    }

    // Prevent overbooking by decreasing availability atomically
    const updatedTicket = await decreaseAvailability(ticketTypeId, quantity);
    if (!updatedTicket) {
      return res.status(400).json({ success: false, message: 'Not enough tickets available' });
    }

    const totalAmount = ticketType.price * quantity;

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      ticketTypeId,
      quantity,
      totalAmount,
      paymentMethod,
      paymentStatus: 'Pending',
      status: 'Pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email role')
      .populate('eventId')
      .populate('ticketTypeId');

    return res.status(201).json({ success: true, message: 'Booking created', data: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings (admin/organizer)
const getAllBookings = async (req, res, next) => {
  try {
    const items = await Booking.find()
      .populate('userId', 'name email role')
      .populate('eventId')
      .populate('ticketTypeId')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Bookings fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my (auth)
const getMyBookings = async (req, res, next) => {
  try {
    const items = await Booking.find({ userId: req.user._id })
      .populate('eventId')
      .populate('ticketTypeId')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'My bookings fetched', data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id (auth: owner OR admin/organizer)
const getSingleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(id)
      .populate('userId', 'name email role')
      .populate('eventId')
      .populate('ticketTypeId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'organizer'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(200).json({ success: true, message: 'Booking fetched', data: booking });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id (admin/organizer)
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const { error, value } = updateBookingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Inventory correctness: do not allow changing a cancelled booking back to active
    // without re-reserving tickets (simpler + safer to disallow).
    if (booking.status === 'Cancelled') {
      if (value.quantity) {
        return res.status(400).json({ success: false, message: 'Cannot change quantity for a cancelled booking' });
      }
      if (value.status && value.status !== 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Cannot change status from Cancelled' });
      }
    }

    // If quantity changes, adjust ticket availability
    if (value.quantity && value.quantity !== booking.quantity) {
      const diff = value.quantity - booking.quantity;
      if (diff > 0) {
        const updatedTicket = await decreaseAvailability(booking.ticketTypeId, diff);
        if (!updatedTicket) {
          return res.status(400).json({ success: false, message: 'Not enough tickets available' });
        }
      } else if (diff < 0) {
        await increaseAvailability(booking.ticketTypeId, Math.abs(diff));
      }

      // Recalculate total
      const ticketType = await TicketType.findById(booking.ticketTypeId);
      booking.quantity = value.quantity;
      booking.totalAmount = ticketType.price * booking.quantity;
    }

    if (value.status) {
      // If booking is being cancelled, restore tickets (only if previously not cancelled)
      if (value.status === 'Cancelled' && booking.status !== 'Cancelled') {
        await increaseAvailability(booking.ticketTypeId, booking.quantity);
      }
      booking.status = value.status;
    }

    await booking.save();
    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email role')
      .populate('eventId')
      .populate('ticketTypeId');

    return res.status(200).json({ success: true, message: 'Booking updated', data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/cancel (auth: owner; staff can also cancel)
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isStaff = ['admin', 'organizer'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Restore tickets
    await increaseAvailability(booking.ticketTypeId, booking.quantity);

    const populated = await Booking.findById(booking._id)
      .populate('eventId')
      .populate('ticketTypeId');

    return res.status(200).json({ success: true, message: 'Booking cancelled', data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/confirm (admin/organizer)
const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is already confirmed' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot confirm a cancelled booking' });
    }

    booking.status = 'Confirmed';
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email role')
      .populate('eventId')
      .populate('ticketTypeId');

    return res.status(200).json({ success: true, message: 'Booking confirmed', data: populated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookings/:id (admin/organizer)
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Restore tickets if booking wasn't cancelled already
    if (booking.status !== 'Cancelled') {
      await increaseAvailability(booking.ticketTypeId, booking.quantity);
    }

    await Booking.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getSingleBooking,
  updateBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
};
