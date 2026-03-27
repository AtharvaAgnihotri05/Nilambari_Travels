const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { login, getDashboard, register } = require('../controllers/adminController');
const { getAllBookings } = require('../controllers/bookingController');

// Public
router.post('/login', loginLimiter, login);

// Protected
router.get('/dashboard', auth, adminAuth, getDashboard);
router.get('/bookings', auth, adminAuth, getAllBookings);
router.post('/register', auth, adminAuth, register);

module.exports = router;
