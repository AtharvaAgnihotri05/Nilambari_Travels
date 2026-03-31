const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bus name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Bus type is required'],
      enum: ['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: 10,
      max: 60,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    seatPrices: {
      type: Map,
      of: Number,
      default: {},
    },
    amenities: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
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

module.exports = mongoose.model('Bus', busSchema);
