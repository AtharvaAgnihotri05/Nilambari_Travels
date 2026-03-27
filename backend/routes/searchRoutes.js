const express = require('express');
const router = express.Router();
const { searchBuses, getSeatAvailability } = require('../controllers/searchController');

// Search buses by route
router.get('/', searchBuses);

// Get seat availability for a bus
router.get('/:busId/seats', getSeatAvailability);

module.exports = router;
