const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} = require('../controllers/busController');

// Public routes
router.get('/', getAllBuses);
router.get('/:id', getBusById);

// Admin routes
router.post('/', auth, adminAuth, createBus);
router.put('/:id', auth, adminAuth, updateBus);
router.delete('/:id', auth, adminAuth, deleteBus);

module.exports = router;
