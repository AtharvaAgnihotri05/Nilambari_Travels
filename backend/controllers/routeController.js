const Route = require('../models/Route');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
exports.getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true }).populate('busId');
    res.json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Public
exports.getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id).populate('busId');
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }
    res.json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new route
// @route   POST /api/routes
// @access  Admin
exports.createRoute = async (req, res, next) => {
  try {
    const { busId, source, destination, departure, arrival, duration, operatingDays } = req.body;
    const route = await Route.create({
      busId,
      source,
      destination,
      departure,
      arrival,
      duration,
      operatingDays,
    });
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Admin
exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }
    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Admin
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }
    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
