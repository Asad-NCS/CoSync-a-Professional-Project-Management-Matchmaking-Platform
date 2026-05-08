const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server and Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for easier testing during graded activity
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Make io accessible globally
global.io = io;

// Socket.io Event Handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a project-specific room
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project room: ${projectId}`);
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.id} left project room: ${projectId}`);
  });

  // Typing indicators
  socket.on('typing', ({ projectId, user }) => {
    socket.to(projectId).emit('user_typing', user);
  });
  
  socket.on('stop_typing', ({ projectId, user }) => {
    socket.to(projectId).emit('user_stop_typing', user);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Placeholders
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const workspaceRoutes = require('./routes/workspaces');
const messageRoutes = require('./routes/messages');
const resourcesRoutes = require('./routes/resourcesRoutes');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/projects/:projectId/resources', resourcesRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('CoSync API is running...');
});

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, status, message });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
