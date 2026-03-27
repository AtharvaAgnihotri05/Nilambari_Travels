const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // Find admin
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboard = async (req, res, next) => {
  try {
    // Total counts
    const totalBuses = await Bus.countDocuments({ isActive: true });
    const totalRoutes = await Route.countDocuments({ isActive: true });

    // Today's bookings
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Today's revenue
    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]);

    const todayRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Total revenue (all time)
    const totalRevenueAgg = await Booking.aggregate([
      {
        $match: { paymentStatus: 'completed' },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]);

    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 0;

    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('busId', 'name type')
      .populate('routeId', 'source destination')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalBuses,
          totalRoutes,
          totalBookings,
          todayBookings,
          todayRevenue,
          totalRevenue,
        },
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new admin (use via seed or superadmin)
// @route   POST /api/admin/register
// @access  Admin/Seed
exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username already exists',
      });
    }

    const admin = await Admin.create({
      username,
      password,
      role: role || 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
