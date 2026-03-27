const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
    },
    source: {
      type: String,
      required: [true, 'Source city is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
    },
    departure: {
      type: String,
      required: [true, 'Departure time is required'],
    },
    arrival: {
      type: String,
      required: [true, 'Arrival time is required'],
    },
    duration: {
      type: String,
      default: '',
    },
    operatingDays: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster search queries
routeSchema.index({ source: 1, destination: 1, isActive: 1 });

module.exports = mongoose.model('Route', routeSchema);
