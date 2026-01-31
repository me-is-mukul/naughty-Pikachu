import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// In-memory state
const rooms = new Map();
const userRooms = new Map();

// Room management
function getOrCreateRoom() {
  // Find room with < 8 people
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.size < 8) {
      return roomId;
    }
  }
  
  // Create new room
  const roomId = uuidv4();
  rooms.set(roomId, {
    id: roomId,
    users: new Map(),
    messages: [],
    activity: 0,
    lastActivity: Date.now()
  });
  
  return roomId;
}

function getRoomsList() {
  return Array.from(rooms.values()).map(room => ({
    id: room.id,
    occupants: room.users.size,
    activity: room.activity
  }));
}

function calculateActivity(room) {
  const now = Date.now();
  const timeSinceActivity = now - room.lastActivity;
  
  // Activity decays over 10 seconds
  const decay = Math.max(0, 1 - (timeSinceActivity / 10000));
  return decay;
}

function cleanupEmptyRooms() {
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.size === 0) {
      rooms.delete(roomId);
    }
  }
}

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current rooms
  socket.on('get_rooms', () => {
    socket.emit('rooms_update', getRoomsList());
  });

  // Join room
  socket.on('join_room', ({ roomId, identity }) => {
    if (!roomId) {
      roomId = getOrCreateRoom();
    }

    const room = rooms.get(roomId);
    if (!room) return;

    // Add user to room
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    
    room.users.set(socket.id, {
      id: socket.id,
      username: identity.username,
      color: identity.color,
      avatar: identity.avatar,
      x: 50,
      y: 50
    });

    // Notify others in room (silently - no join message)
    socket.to(roomId).emit('user_joined', {
      userId: socket.id,
      username: identity.username,
      color: identity.color,
      avatar: identity.avatar
    });

    // Update rooms list
    io.emit('rooms_update', getRoomsList());

    console.log(`User ${identity.username} joined room ${roomId}`);
  });

  // Cursor movement
  socket.on('cursor_move', ({ roomId, x, y }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (!user) return;

    user.x = x;
    user.y = y;
    room.lastActivity = Date.now();
    room.activity = Math.min(1, room.activity + 0.1);

    // Broadcast to others in room
    socket.to(roomId).emit('cursor_update', {
      userId: socket.id,
      x,
      y,
      username: user.username,
      color: user.color,
      avatar: user.avatar
    });
  });

  // Send message
  socket.on('send_message', ({ roomId, text }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      userId: user.username,
      username: user.username,
      color: user.color,
      avatar: user.avatar,
      text,
      timestamp: Date.now()
    };

    room.messages.push(message);
    room.lastActivity = Date.now();
    room.activity = 1;

    // Broadcast to everyone in room (including sender)
    io.to(roomId).emit('message', message);

    // Clean old messages (keep last 50)
    if (room.messages.length > 50) {
      room.messages = room.messages.slice(-50);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);
      
      // Notify others (silently)
      socket.to(roomId).emit('user_left', { userId: socket.id });
    }

    userRooms.delete(socket.id);
    cleanupEmptyRooms();
    
    // Update rooms list
    io.emit('rooms_update', getRoomsList());

    console.log('User disconnected:', socket.id);
  });
});

// Activity decay interval
setInterval(() => {
  for (const room of rooms.values()) {
    room.activity = calculateActivity(room);
  }
  io.emit('rooms_update', getRoomsList());
}, 1000);

// Auto-create seed rooms
function ensureMinimumRooms() {
  if (rooms.size < 3) {
    getOrCreateRoom();
  }
}

setInterval(ensureMinimumRooms, 5000);
ensureMinimumRooms();

// Serve built frontend when available (production)
const distPath = path.resolve(process.cwd(), '..', 'dist');
try {
  // If the Vite build exists, serve static files from it
  // This makes the backend a single deployable image that serves the frontend
  app.use(express.static(distPath));

  // Serve index.html for SPA routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} catch (err) {
  // if dist doesn't exist, continue — frontend can be served separately in dev
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🕳️  GhostRooms server running on port ${PORT}`);
});