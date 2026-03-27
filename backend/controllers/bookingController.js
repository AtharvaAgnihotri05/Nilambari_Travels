const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res, next) => {
  try {
    const {
      busId,
      routeId,
      passengerName,
      passengerPhone,
      seats,
      travelDate,
    } = req.body;

    // Get bus details for pricing
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    // Check if seats are already booked for this date
    const dateObj = new Date(travelDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const existingBookings = await Booking.find({
      busId,
      routeId,
      travelDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] },
    });

    const bookedSeats = existingBookings.reduce((acc, b) => [...acc, ...b.seats], []);
    const conflictSeats = seats.filter((s) => bookedSeats.includes(s));

    if (conflictSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${conflictSeats.join(', ')} are already booked`,
        conflictSeats,
      });
    }

    // Calculate pricing
    const pricePerSeat = bus.price;
    const totalAmount = seats.length * pricePerSeat;
    const tax = Math.round(totalAmount * 0.05);
    const grandTotal = totalAmount + tax;

    // Create booking
    const booking = await Booking.create({
      busId,
      routeId,
      passengerName,
      passengerPhone,
      seats,
      travelDate,
      pricePerSeat,
      totalAmount,
      tax,
      grandTotal,
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Booking created. Proceed to payment.',
      data: {
        bookingId: booking.bookingId,
        _id: booking._id,
        seats: booking.seats,
        grandTotal: booking.grandTotal,
        pricePerSeat: booking.pricePerSeat,
        totalAmount: booking.totalAmount,
        tax: booking.tax,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by booking ID
// @route   GET /api/bookings/:bookingId
// @access  Public
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('busId')
      .populate('routeId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:bookingId/cancel
// @access  Public
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = booking.paymentStatus === 'completed' ? 'refunded' : 'failed';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      query.travelDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('busId', 'name type')
      .populate('routeId', 'source destination')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
