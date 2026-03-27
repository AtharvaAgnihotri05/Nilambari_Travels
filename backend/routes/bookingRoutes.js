const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  createBooking,
  getBooking,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');

// Public routes
router.post('/', createBooking);
router.get('/:bookingId', getBooking);
router.put('/:bookingId/cancel', cancelBooking);

// Admin route
router.get('/', auth, adminAuth, getAllBookings);

module.exports = router;
