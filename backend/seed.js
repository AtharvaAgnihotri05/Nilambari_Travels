/**
 * Seed Script - Populates the database with initial data
 * 
 * Run: npm run seed (or: node seed.js)
 * 
 * Creates:
 *  - 1 Admin user (admin / 1234)
 *  - 5 Buses
 *  - Routes for each bus
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Bus = require('./models/Bus');
const Route = require('./models/Route');

const MONGODB_URI = process.env.MONGODB_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Admin.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin
    const admin = await Admin.create({
      username: 'admin',
      password: '1234',
      role: 'superadmin',
    });
    console.log(`👤 Admin created: ${admin.username}`);

    // Create buses
    const buses = await Bus.insertMany([
      {
        name: 'Nilambari Express',
        type: 'AC Sleeper',
        totalSeats: 30,
        price: 750,
        amenities: ['AC', 'WiFi', 'Charging Point'],
        rating: 4.5,
      }
    ]);
    console.log(`🚌 ${buses.length} buses created`);

    // Create routes for each bus
    const routeData = [
      {
        busId: buses[0]._id,
        source: 'Pune',
        destination: 'Akola',
        departure: '06:00 AM',
        arrival: '12:00 PM',
        duration: '6h 0m',
      },
      {
        busId: buses[0]._id,
        source: 'Akola',
        destination: 'Pune',
        departure: '10:00 PM',
        arrival: '05:00 AM',
        duration: '7h 0m',
      }
    ];

    const routes = await Route.insertMany(routeData);
    console.log(`🗺️  ${routes.length} routes created`);

    console.log('\n✅ Seed completed successfully!');
    console.log('─────────────────────────────');
    console.log('Admin Login:');
    console.log('  Username: admin');
    console.log('  Password: 1234');
    console.log('─────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedData();
