const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
} = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment signature
router.post('/verify', verifyPayment);

// Get payment status
router.get('/:bookingId', getPaymentStatus);

module.exports = router;
