const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Booking = require('../models/Booking');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    // Find booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking',
      });
    }

    // Create Razorpay order
    const options = {
      amount: booking.grandTotal * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        passengerName: booking.passengerName,
        passengerPhone: booking.passengerPhone,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking.bookingId,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Public
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Payment verification failed
      const booking = await Booking.findOne({ bookingId });
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Payment verified - update booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paymentStatus = 'completed';
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed!',
      data: {
        bookingId: booking.bookingId,
        paymentId: razorpay_payment_id,
        status: 'confirmed',
        grandTotal: booking.grandTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:bookingId
// @access  Public
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        paymentStatus: booking.paymentStatus,
        razorpayOrderId: booking.razorpayOrderId,
        razorpayPaymentId: booking.razorpayPaymentId,
        grandTotal: booking.grandTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};
