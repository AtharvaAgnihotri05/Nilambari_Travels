/**
 * ============================================
 * Nilambari Travels - Backend Server
 * ============================================
 * 
 * Express.js server with:
 *  - MongoDB (Mongoose)
 *  - JWT Authentication
 *  - Razorpay Payment Gateway
 *  - Socket.io Real-time Seat Concurrency
 *  - Security middleware (helmet, cors, rate limiting)
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Config
const connectDB = require('./config/db');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Socket
const initSeatSocket = require('./socket/seatSocket');

// ─── Initialize App ───
const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ───
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize seat socket handler
initSeatSocket(io);

// ─── Middleware ───
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts from frontend
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// ─── API Routes ───
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Nilambari Travels API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Serve Frontend (Static Files) ───
// In production, serve the frontend from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// ─── 404 Handler ───
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Connect to DB & Start Server ───
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('  ======================================================');
      console.log('  |                                                    |');
      console.log('  |   [ Nilambari Travels Backend Server ]             |');
      console.log('  |                                                    |');
      console.log(`  |   API:    http://localhost:${PORT}/api             |`);
      console.log(`  |   App:    http://localhost:${PORT}                 |`);
      console.log('  |   Socket: /seats namespace                         |');
      console.log('  |                                                    |');
      console.log('  ======================================================');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
