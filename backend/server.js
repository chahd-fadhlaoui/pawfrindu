import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import uploadRouter from './routes/uploadRoutes.js';
import petRouter from './routes/petRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

// App config
const app = express();
const port = process.env.PORT || 8500;

// Create an HTTP server for Socket.io
const server = createServer(app);

// Initialize Socket.io with the HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Match the frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Match Socket.IO CORS origin
  credentials: true,
}));

// API endpoints
app.use('/api/user', userRouter);
console.log('User router mounted at /api/user');
app.use('/api', uploadRouter);
app.use('/api/pet', petRouter);

// Create 'uploads' directory if it doesn’t exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io accessible to all routes
app.set('io', io);

app.get('/', (req, res) => {
  res.send('API working great');
});

// Start the server
server.listen(port, () => console.log("Server started on port", port));

// Export io for use in controllers
export { io };