import express from 'express';
import cors from "cors";
import http from 'http';
import { Server } from "socket.io";
import authRoutes from './routes/auth.routes';
import boardRoutes from "./routes/board.routes";
import listRoutes from './routes/list.routes';
import cardRoutes from './routes/card.routes';
import commentRoutes from "./routes/comment.routes";
import tagRoutes from "./routes/tag.routes";
import userRoutes from "./routes/user.routes";
import activityRoutes from './routes/activity.routes';
import memberRoutes from './routes/member.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger'; 
import logger from './config/logger';
import { initializeSocketHandlers } from '../src/socket/socketHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger); // Request logging

// Make io accessible in routes
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    socketConnections: io.sockets.sockets.size 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes); 
app.use('/api/cards', cardRoutes); 
app.use('/api/comments', commentRoutes); // Changed from /api/cards to /api/comments
app.use("/api/tags", tagRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);


// Error handlers (MUST be last!)
app.use(notFoundHandler);  // 404 for undefined routes
app.use(errorHandler);     // Centralized error handling

// Initialize Socket.io handlers
initializeSocketHandlers(io);

httpServer.listen(PORT, () => {
  logger.info(` FlowDeck API running on http://localhost:${PORT}`);
  logger.info(` Health check: http://localhost:${PORT}/health`);
  logger.info(` Socket.io initialized`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
