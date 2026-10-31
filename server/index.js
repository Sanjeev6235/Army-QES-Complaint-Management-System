const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const multer = require('multer');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Fail fast when required production secrets/configuration are missing.
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.MONGODB_URI || !process.env.CLIENT_URL)) {
  throw new Error('JWT_SECRET, MONGODB_URI and CLIENT_URL must be configured in production');
}

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Return consistent JSON errors for upload limits, invalid files and unexpected API errors.
app.use((err, req, res, next) => {
  console.error('Request error:', err.message);
  if (res.headersSent) return next(err);
  const status = err instanceof multer.MulterError ? 400 : (err.status || 500);
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : err.message });
});

// Authenticate every socket with the same JWT used by REST APIs.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token || !process.env.JWT_SECRET) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id isActive');
    if (!user || !user.isActive) return next(new Error('Unauthorized'));
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);
  console.log('Authenticated socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/army-qes')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
