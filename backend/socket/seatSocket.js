/**
 * Socket.io Seat Concurrency Handler
 * 
 * Manages real-time seat locking/unlocking to prevent double bookings.
 * Uses MongoDB SeatLock model for atomic distributed locking.
 * 
 * Room format: "bus_<busId>_<date>"
 */

const SeatLock = require('../models/SeatLock');

function getRoomName(busId, date) {
  return `bus_${busId}_${date}`;
}

function initSeatSocket(io) {
  const seatNamespace = io.of('/seats');

  seatNamespace.on('connection', (socket) => {
    console.log(`🔌 Seat socket connected: ${socket.id}`);

    // Join a bus room for real-time updates
    socket.on('join-bus', async ({ busId, date }) => {
      if (!busId || !date) return;

      const room = getRoomName(busId, date);
      socket.join(room);
      socket.busId = busId;
      socket.date = date;

      console.log(`👤 ${socket.id} joined room: ${room}`);

      // Send current valid locked seats to the new user
      // TTL index cleans up periodically, but we forcefully exclude expired ones
      try {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const lockedSeatsDb = await SeatLock.find({
          busId,
          travelDate: date,
          createdAt: { $gte: fiveMinsAgo }
        }).select('seatNumber socketId -_id');

        const lockedSeats = lockedSeatsDb.map((l) => ({ seat: l.seatNumber, userId: l.socketId }));
        
        socket.emit('seats-status', {
          lockedSeats: lockedSeats.filter((l) => l.userId !== socket.id),
        });
      } catch (error) {
        console.error('Error fetching initial seat locks:', error.message);
      }
    });

    // User selects (locks) a seat
    socket.on('select-seat', async ({ busId, date, seat }) => {
      if (!busId || !date || !seat) return;

      try {
        // Attempt an atomic lock insert
        await SeatLock.create({
          busId,
          travelDate: date,
          seatNumber: seat,
          socketId: socket.id,
        });

        // Broadcast lock success to the room
        const room = getRoomName(busId, date);
        socket.to(room).emit('seat-locked', {
          seat,
          userId: socket.id,
        });

        socket.emit('seat-lock-success', { seat });
        console.log(`🔒 Seat ${seat} remotely locked by ${socket.id} in ${room}`);
      } catch (error) {
        // 11000 is Duplicate Key Error (Atomic constraint violated)
        if (error.code === 11000) {
          socket.emit('seat-lock-failed', {
            seat,
            message: 'This seat is currently being held by another user',
          });
        } else {
          console.error('Error selecting seat:', error.message);
          socket.emit('seat-lock-failed', { seat, message: 'System error locking seat' });
        }
      }
    });

    // User deselects (unlocks) a seat
    socket.on('deselect-seat', async ({ busId, date, seat }) => {
      if (!busId || !date || !seat) return;

      try {
        // Find and delete the lock ONLY if the current socket owns it
        const result = await SeatLock.deleteOne({
          busId,
          travelDate: date,
          seatNumber: seat,
          socketId: socket.id,
        });

        if (result.deletedCount > 0) {
          const room = getRoomName(busId, date);
          socket.to(room).emit('seat-released', { seat });
          console.log(`🔓 Seat ${seat} released by ${socket.id} in ${room}`);
        }
      } catch (error) {
        console.error('Error deselecting seat:', error.message);
      }
    });

    // Seats booked (payment confirmed)
    socket.on('seats-booked', async ({ busId, date, seats }) => {
      if (!busId || !date || !seats || !Array.isArray(seats)) return;

      try {
        // Remove locks for the permanently booked seats
        await SeatLock.deleteMany({
          busId,
          travelDate: date,
          seatNumber: { $in: seats },
        });

        // Broadcast to all users in room that these seats are now permanently booked
        const room = getRoomName(busId, date);
        io.of('/seats').to(room).emit('seat-booked', { seats });
        console.log(`✅ Seats ${seats.join(', ')} booked in ${room}`);
      } catch (error) {
        console.error('Error confirming seats booked:', error.message);
      }
    });

    // User leaves the bus room
    socket.on('leave-bus', async ({ busId, date }) => {
      if (!busId || !date) return;

      const room = getRoomName(busId, date);
      socket.leave(room);

      // Release all locks held by this user for this specific room
      await releaseUserLocks(seatNamespace, socket, busId, date);
      console.log(`👋 ${socket.id} left room: ${room}`);
    });

    // Disconnect - release all locks
    socket.on('disconnect', async () => {
      console.log(`🔌 Seat socket disconnected: ${socket.id}`);

      // General release of all locks globally held by user
      try {
        const locks = await SeatLock.find({ socketId: socket.id });
        if (locks.length > 0) {
          await SeatLock.deleteMany({ socketId: socket.id });

          // Broadcast release to contextual rooms
          locks.forEach((lock) => {
            const room = getRoomName(lock.busId, lock.travelDate);
            seatNamespace.to(room).emit('seat-released', { seat: lock.seatNumber });
          });
          
          console.log(`🧹 Released ${locks.length} Mongo locks for disconnected user ${socket.id}`);
        }
      } catch (error) {
        console.error('Error on disconnect cleanup:', error.message);
      }
    });
  });

  console.log('🔌 Socket.io seat handler initialized (MongoDB Atomic Locks)');
}

async function releaseUserLocks(seatNamespace, socket, busId, date) {
  try {
    const room = getRoomName(busId, date);
    
    // Find before deleting so we can extract exact seats
    const locks = await SeatLock.find({ busId, travelDate: date, socketId: socket.id });
    
    if (locks.length > 0) {
      await SeatLock.deleteMany({ _id: { $in: locks.map(l => l._id) } });

      locks.forEach((lock) => {
        socket.to(room).emit('seat-released', { seat: lock.seatNumber });
      });
    }
  } catch (error) {
    console.error('Error manually releasing user locks:', error.message);
  }
}

module.exports = initSeatSocket;
