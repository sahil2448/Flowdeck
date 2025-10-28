import express from 'express';
import cors from "cors";
import authRoutes from '../src/routes/auth.routes';
import boardRoutes from "../src/routes/board.routes"
import listRoutes from '../src/routes/list.routes';
import cardRoutes from '../src/routes/card.routes';
import commentRoutes from "../src/routes/comment.routes"
import tagRoutes from "../src/routes/tag.routes"
import activityRoutes from './routes/activity.routes'; // ✅ Add this


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes); 
app.use('/api/cards', cardRoutes); 
app.use('/api/comments', commentRoutes); 
app.use("/api/tags",tagRoutes)
app.use('/api/activity', activityRoutes); // ✅ Add this


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 FlowDeck API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
