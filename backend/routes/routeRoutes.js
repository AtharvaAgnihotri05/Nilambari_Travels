const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');

// Public routes
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);

// Admin routes
router.post('/', auth, adminAuth, createRoute);
router.put('/:id', auth, adminAuth, updateRoute);
router.delete('/:id', auth, adminAuth, deleteRoute);

module.exports = router;
