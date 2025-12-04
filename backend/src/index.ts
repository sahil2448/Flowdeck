import express from 'express';
import cors from "cors";
import authRoutes from './routes/auth.routes';
import boardRoutes from "./routes/board.routes"
import listRoutes from './routes/list.routes';
import cardRoutes from './routes/card.routes';
import commentRoutes from "./routes/comment.routes"
import tagRoutes from "./routes/tag.routes"
import userRoutes from "./routes/user.routes";
import activityRoutes from './routes/activity.routes';
import http from 'http';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger'; 
import logger from './config/logger';

import {Server} from "socket.io"

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors(
  {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  }
));
app.use(express.json());
app.set('io', io);

app.use(requestLogger); //  request logging

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes); 
app.use('/api/cards', cardRoutes); 
app.use('/api/cards', commentRoutes); 
app.use("/api/tags",tagRoutes)
app.use('/api/activity', activityRoutes); //  Add this
app.use('/api/users', userRoutes); //  Now /api/users/profile works!

// Error handlers (MUST be last!)
app.use(notFoundHandler);  // 404 for undefined routes
app.use(errorHandler);      // Centralized error handling

const socketHandler = require('./socket/socketHandler');
socketHandler(io);

app.listen(PORT, () => {
  logger.info(`🚀 FlowDeck API running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});
