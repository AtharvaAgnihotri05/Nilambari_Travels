const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    travelDate: {
      type: String, // String format YYYY-MM-DD
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300 // TTL index: automatically deletes document after 300 seconds (5 minutes)
    },
  }
);

// Compound unique index to enforce atomic locks
// Only one person can lock a specific seat on a specific bus for a specific date
seatLockSchema.index({ busId: 1, travelDate: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('SeatLock', seatLockSchema);
