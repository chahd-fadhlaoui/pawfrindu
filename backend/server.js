import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import connectCloudinary from './config/cloudinary.js';
import connectDB from './config/mongodb.js';
import appointmentRouter from './routes/appointmentRoute.js';
import lostAndFoundRouter from './routes/lostAndFoundRoute.js';
import PaymentRouter from './routes/paymentRoute.js';
import petRouter from './routes/petRoute.js';
import uploadRouter from './routes/uploadRoutes.js';
import userRouter from './routes/userRoute.js';

// App config
const app = express();
const port = process.env.PORT || 8500;

// Create an HTTP server for Socket.io
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'], // Explicit array for clarity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// API endpoints
app.use('/api/user', userRouter);
console.log('User router mounted at /api/user');
app.use('/api', uploadRouter);
app.use('/api/pet', petRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/payment', PaymentRouter);
app.use('/api/lost-and-found',lostAndFoundRouter );

// Create 'Uploads' directory
const uploadDir = path.join(process.cwd(), 'Uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created successfully');
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  socket.on('error', (error) => console.error('Socket error:', error));
});

app.set('io', io);

app.get('/', (req, res) => res.send('API working great'));

// Start the server
server.listen(port, () => console.log("Server started on port", port));

export { io };

