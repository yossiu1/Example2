import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from './db.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// ─── REST ROUTES ────────────────────────────────────────────────

// GET /rooms — list all rooms
app.get('/rooms', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM rooms ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /rooms — create a new room
app.post('/rooms', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Name required' });

  const clean = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (!clean) return res.status(400).json({ error: 'Invalid name' });

  try {
    const { rows } = await db.query(
      'INSERT INTO rooms (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
      [clean]
    );
    if (rows.length === 0) return res.status(409).json({ error: 'Room already exists' });
    io.emit('room:created', rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /rooms/:roomId/messages — fetch last N messages for a room
app.get('/rooms/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);

  try {
    const { rows } = await db.query(
      `SELECT m.id, m.nickname, m.content, m.created_at, r.name AS room_name
       FROM messages m
       JOIN rooms r ON r.id = m.room_id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [roomId, limit]
    );
    res.json(rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ─── SOCKET.IO ───────────────────────────────────────────────────

// Track online users per room: { roomId: Set<socketId> }
const roomUsers = {};

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  // Client joins a room
  socket.on('room:join', async ({ roomId, nickname }) => {
    // Leave previous room if any
    const prevRoom = socket.data.roomId;
    if (prevRoom) {
      socket.leave(String(prevRoom));
      if (roomUsers[prevRoom]) roomUsers[prevRoom].delete(socket.id);
      io.to(String(prevRoom)).emit('room:online', { roomId: prevRoom, count: roomUsers[prevRoom]?.size || 0 });
    }

    socket.data.roomId = roomId;
    socket.data.nickname = nickname;
    socket.join(String(roomId));

    if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
    roomUsers[roomId].add(socket.id);

    io.to(String(roomId)).emit('room:online', { roomId, count: roomUsers[roomId].size });
    console.log(`[socket] ${nickname} joined room ${roomId}`);
  });

  // Client sends a message
  socket.on('message:send', async ({ roomId, nickname, content }) => {
    if (!content?.trim() || !nickname?.trim()) return;

    try {
      const { rows } = await db.query(
        'INSERT INTO messages (room_id, nickname, content) VALUES ($1, $2, $3) RETURNING *',
        [roomId, nickname.trim().slice(0, 32), content.trim().slice(0, 2000)]
      );
      const msg = rows[0];
      io.to(String(roomId)).emit('message:new', msg);
    } catch (err) {
      console.error('Failed to save message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Disconnect cleanup
  socket.on('disconnect', () => {
    const { roomId } = socket.data;
    if (roomId && roomUsers[roomId]) {
      roomUsers[roomId].delete(socket.id);
      io.to(String(roomId)).emit('room:online', { roomId, count: roomUsers[roomId].size });
    }
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

// ─── START ───────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
