/**
 * Socket.io Seat Concurrency Handler
 * 
 * Manages real-time seat locking/unlocking to prevent double bookings.
 * Uses in-memory Map with TTL for seat locks.
 * 
 * Room format: "bus_<busId>_<date>"
 * Lock format: "bus_<busId>_<date>_seat_<seatNum>"
 */

// In-memory seat lock store: Map<lockKey, { userId, timestamp }>
const seatLocks = new Map();

// Lock timeout: 5 minutes
const LOCK_TIMEOUT = 5 * 60 * 1000;

// Cleanup expired locks every 60 seconds
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, lock] of seatLocks.entries()) {
    if (now - lock.timestamp > LOCK_TIMEOUT) {
      seatLocks.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired seat locks`);
  }
}, 60 * 1000);

function getRoomName(busId, date) {
  return `bus_${busId}_${date}`;
}

function getLockKey(busId, date, seat) {
  return `bus_${busId}_${date}_seat_${seat}`;
}

function getLockedSeats(busId, date) {
  const prefix = `bus_${busId}_${date}_seat_`;
  const locked = [];
  const now = Date.now();

  for (const [key, lock] of seatLocks.entries()) {
    if (key.startsWith(prefix) && now - lock.timestamp <= LOCK_TIMEOUT) {
      const seatNum = parseInt(key.replace(prefix, ''));
      locked.push({ seat: seatNum, userId: lock.userId });
    }
  }
  return locked;
}

function initSeatSocket(io) {
  const seatNamespace = io.of('/seats');

  seatNamespace.on('connection', (socket) => {
    console.log(`🔌 Seat socket connected: ${socket.id}`);

    // Join a bus room for real-time updates
    socket.on('join-bus', ({ busId, date }) => {
      if (!busId || !date) return;

      const room = getRoomName(busId, date);
      socket.join(room);
      socket.busId = busId;
      socket.date = date;

      console.log(`👤 ${socket.id} joined room: ${room}`);

      // Send current locked seats to the new user
      const lockedSeats = getLockedSeats(busId, date);
      socket.emit('seats-status', {
        lockedSeats: lockedSeats.filter((l) => l.userId !== socket.id),
      });
    });

    // User selects (locks) a seat
    socket.on('select-seat', ({ busId, date, seat }) => {
      if (!busId || !date || !seat) return;

      const lockKey = getLockKey(busId, date, seat);
      const existingLock = seatLocks.get(lockKey);

      // Check if seat is already locked by someone else
      if (existingLock && existingLock.userId !== socket.id) {
        const now = Date.now();
        if (now - existingLock.timestamp <= LOCK_TIMEOUT) {
          // Seat is locked by another user
          socket.emit('seat-lock-failed', {
            seat,
            message: 'This seat is being held by another user',
          });
          return;
        }
      }

      // Lock the seat
      seatLocks.set(lockKey, {
        userId: socket.id,
        timestamp: Date.now(),
      });

      // Broadcast to other users in the room
      const room = getRoomName(busId, date);
      socket.to(room).emit('seat-locked', {
        seat,
        userId: socket.id,
      });

      socket.emit('seat-lock-success', { seat });
      console.log(`🔒 Seat ${seat} locked by ${socket.id} in ${room}`);
    });

    // User deselects (unlocks) a seat
    socket.on('deselect-seat', ({ busId, date, seat }) => {
      if (!busId || !date || !seat) return;

      const lockKey = getLockKey(busId, date, seat);
      const existingLock = seatLocks.get(lockKey);

      // Only the user who locked it can unlock it
      if (existingLock && existingLock.userId === socket.id) {
        seatLocks.delete(lockKey);

        const room = getRoomName(busId, date);
        socket.to(room).emit('seat-released', { seat });
        console.log(`🔓 Seat ${seat} released by ${socket.id} in ${room}`);
      }
    });

    // Seats booked (payment confirmed)
    socket.on('seats-booked', ({ busId, date, seats }) => {
      if (!busId || !date || !seats) return;

      // Remove locks for booked seats
      seats.forEach((seat) => {
        const lockKey = getLockKey(busId, date, seat);
        seatLocks.delete(lockKey);
      });

      // Broadcast to all users in room that these seats are now permanently booked
      const room = getRoomName(busId, date);
      io.of('/seats').to(room).emit('seat-booked', { seats });
      console.log(`✅ Seats ${seats.join(', ')} booked in ${room}`);
    });

    // User leaves the bus room
    socket.on('leave-bus', ({ busId, date }) => {
      if (!busId || !date) return;

      const room = getRoomName(busId, date);
      socket.leave(room);

      // Release all locks held by this user for this bus/date
      releaseUserLocks(socket, busId, date);
      console.log(`👋 ${socket.id} left room: ${room}`);
    });

    // Disconnect - release all locks
    socket.on('disconnect', () => {
      console.log(`🔌 Seat socket disconnected: ${socket.id}`);

      // Release all locks held by this user
      const keysToDelete = [];
      for (const [key, lock] of seatLocks.entries()) {
        if (lock.userId === socket.id) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => {
        seatLocks.delete(key);

        // Extract busId, date, seat from key to broadcast
        const parts = key.split('_');
        // Format: bus_<busId>_<date>_seat_<seatNum>
        // busId could contain underscores in theory, but our IDs are MongoDB ObjectIds
        const seat = parseInt(parts[parts.length - 1]);
        const busId = parts[1];
        const date = parts[2];
        const room = getRoomName(busId, date);

        seatNamespace.to(room).emit('seat-released', { seat });
      });

      if (keysToDelete.length > 0) {
        console.log(`🧹 Released ${keysToDelete.length} locks for disconnected user ${socket.id}`);
      }
    });
  });

  console.log('🔌 Socket.io seat handler initialized');
}

function releaseUserLocks(socket, busId, date) {
  const prefix = `bus_${busId}_${date}_seat_`;
  const room = getRoomName(busId, date);

  for (const [key, lock] of seatLocks.entries()) {
    if (key.startsWith(prefix) && lock.userId === socket.id) {
      const seat = parseInt(key.replace(prefix, ''));
      seatLocks.delete(key);
      socket.to(room).emit('seat-released', { seat });
    }
  }
}

module.exports = initSeatSocket;
