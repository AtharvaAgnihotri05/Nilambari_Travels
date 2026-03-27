const Bus = require('../models/Bus');

// @desc    Get all active buses
// @route   GET /api/buses
// @access  Public
exports.getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bus by ID
// @route   GET /api/buses/:id
// @access  Public
exports.getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new bus
// @route   POST /api/buses
// @access  Admin
exports.createBus = async (req, res, next) => {
  try {
    const { name, type, totalSeats, price, amenities } = req.body;
    const bus = await Bus.create({ name, type, totalSeats, price, amenities });
    res.status(201).json({
      success: true,
      message: 'Bus added successfully',
      data: bus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bus details
// @route   PUT /api/buses/:id
// @access  Admin
exports.updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    res.json({
      success: true,
      message: 'Bus updated successfully',
      data: bus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove bus (soft delete)
// @route   DELETE /api/buses/:id
// @access  Admin
exports.deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    res.json({
      success: true,
      message: 'Bus removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
