const Route = require('../models/Route');
const Booking = require('../models/Booking');

// @desc    Search buses by source, destination, and date
// @route   GET /api/search?source=X&destination=Y&date=Z
// @access  Public
exports.searchBuses = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination are required',
      });
    }

    // Find routes matching source and destination
    const routes = await Route.find({
      source: { $regex: new RegExp(`^${source}$`, 'i') },
      destination: { $regex: new RegExp(`^${destination}$`, 'i') },
      isActive: true,
    }).populate('busId');

    // Filter out routes where bus is inactive
    const activeRoutes = routes.filter((r) => r.busId && r.busId.isActive);

    // For each route, get booked seats for the given date
    const results = await Promise.all(
      activeRoutes.map(async (route) => {
        let bookedSeats = [];

        if (date) {
          const travelDate = new Date(date);
          const startOfDay = new Date(travelDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(travelDate.setHours(23, 59, 59, 999));

          const bookings = await Booking.find({
            busId: route.busId._id,
            routeId: route._id,
            travelDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['confirmed', 'pending'] },
          });

          bookedSeats = bookings.reduce((acc, b) => [...acc, ...b.seats], []);
        }

        return {
          routeId: route._id,
          bus: {
            _id: route.busId._id,
            name: route.busId.name,
            type: route.busId.type,
            totalSeats: route.busId.totalSeats,
            price: route.busId.price,
            amenities: route.busId.amenities,
            rating: route.busId.rating,
          },
          source: route.source,
          destination: route.destination,
          departure: route.departure,
          arrival: route.arrival,
          duration: route.duration,
          availableSeats: route.busId.totalSeats - bookedSeats.length,
          bookedSeats: [...new Set(bookedSeats)],
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat availability for a specific bus on a date
// @route   GET /api/search/:busId/seats?date=Z&routeId=R
// @access  Public
exports.getSeatAvailability = async (req, res, next) => {
  try {
    const { busId } = req.params;
    const { date, routeId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const travelDate = new Date(date);
    const startOfDay = new Date(travelDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(travelDate.setHours(23, 59, 59, 999));

    const query = {
      busId,
      travelDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] },
    };

    if (routeId) {
      query.routeId = routeId;
    }

    const bookings = await Booking.find(query);
    const bookedSeats = [...new Set(bookings.reduce((acc, b) => [...acc, ...b.seats], []))];

    res.json({
      success: true,
      data: {
        busId,
        date,
        bookedSeats,
        totalBooked: bookedSeats.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
