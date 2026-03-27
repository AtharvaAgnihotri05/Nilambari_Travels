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
      },
      {
        name: 'Shivneri Deluxe',
        type: 'Non-AC Seater',
        totalSeats: 30,
        price: 450,
        amenities: ['Charging Point', 'Water Bottle'],
        rating: 4.2,
      },
      {
        name: 'Royal Traveller',
        type: 'AC Seater',
        totalSeats: 30,
        price: 600,
        amenities: ['AC', 'Blanket', 'Charging Point', 'Snacks'],
        rating: 4.7,
      },
      {
        name: 'Comfort Liner',
        type: 'AC Sleeper',
        totalSeats: 30,
        price: 850,
        amenities: ['AC', 'WiFi', 'Blanket', 'Charging Point', 'Snacks', 'Entertainment'],
        rating: 4.8,
      },
      {
        name: 'Sahyadri Fast',
        type: 'Non-AC Seater',
        totalSeats: 30,
        price: 350,
        amenities: ['Water Bottle'],
        rating: 3.9,
      },
    ]);
    console.log(`🚌 ${buses.length} buses created`);

    // Create routes for each bus
    const routeData = [
      {
        busId: buses[0]._id,
        source: 'Pune',
        destination: 'Mumbai',
        departure: '06:00 AM',
        arrival: '12:00 PM',
        duration: '6h 0m',
      },
      {
        busId: buses[1]._id,
        source: 'Pune',
        destination: 'Mumbai',
        departure: '08:30 AM',
        arrival: '03:30 PM',
        duration: '7h 0m',
      },
      {
        busId: buses[2]._id,
        source: 'Mumbai',
        destination: 'Nashik',
        departure: '10:00 PM',
        arrival: '05:00 AM',
        duration: '7h 0m',
      },
      {
        busId: buses[3]._id,
        source: 'Pune',
        destination: 'Nagpur',
        departure: '11:30 PM',
        arrival: '06:30 AM',
        duration: '7h 0m',
      },
      {
        busId: buses[4]._id,
        source: 'Nashik',
        destination: 'Pune',
        departure: '02:00 PM',
        arrival: '08:00 PM',
        duration: '6h 0m',
      },
      // Additional routes
      {
        busId: buses[0]._id,
        source: 'Mumbai',
        destination: 'Pune',
        departure: '04:00 PM',
        arrival: '10:00 PM',
        duration: '6h 0m',
      },
      {
        busId: buses[2]._id,
        source: 'Nashik',
        destination: 'Mumbai',
        departure: '06:00 AM',
        arrival: '01:00 PM',
        duration: '7h 0m',
      },
      {
        busId: buses[3]._id,
        source: 'Nagpur',
        destination: 'Pune',
        departure: '09:00 PM',
        arrival: '04:00 AM',
        duration: '7h 0m',
      },
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
