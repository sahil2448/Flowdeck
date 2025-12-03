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
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger'; 
import logger from './config/logger';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger); //  request logging

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes); 
app.use('/api/cards', cardRoutes); 
app.use('/api/comments', commentRoutes); 
app.use("/api/tags",tagRoutes)
app.use('/api/activity', activityRoutes); //  Add this
app.use('/api/users', userRoutes); //  Now /api/users/profile works!

// Error handlers (MUST be last!)
app.use(notFoundHandler);  // 404 for undefined routes
app.use(errorHandler);      // Centralized error handling


app.listen(PORT, () => {
  logger.info(`🚀 FlowDeck API running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});
