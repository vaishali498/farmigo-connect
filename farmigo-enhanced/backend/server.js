const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const farmerRoutes = require('./routes/farmerRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'farmigo_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false, httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/farmer', farmerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// Session check
app.get('/api/check-session', (req, res) => res.json(req.session));

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

// Socket.io for Chat
const chatMessages = {};
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (chatMessages[roomId]) {
      socket.emit('chat-history', chatMessages[roomId]);
    }
  });

  socket.on('send-message', (data) => {
    const { roomId, message, sender, senderName } = data;
    const msg = { message, sender, senderName, time: new Date().toISOString() };
    if (!chatMessages[roomId]) chatMessages[roomId] = [];
    chatMessages[roomId].push(msg);
    if (chatMessages[roomId].length > 100) chatMessages[roomId].shift();
    io.to(roomId).emit('receive-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmersMarketplace')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
