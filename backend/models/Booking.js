const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route ID is required'],
    },
    passengerName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
    },
    passengerPhone: {
      type: String,
      required: [true, 'Passenger phone is required'],
      match: [/^[0-9]{10}$/, 'Phone must be 10 digits'],
    },
    seats: {
      type: [Number],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: (v) => v.length > 0 && v.length <= 6,
        message: 'You can book between 1 and 6 seats',
      },
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    pricePerSeat: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for seat availability lookup
bookingSchema.index({ busId: 1, travelDate: 1, status: 1 });

// Generate booking ID before saving
bookingSchema.pre('validate', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'NLT' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-3).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
