import { TypedServer, TypedSocket } from '../types/socket';

export function initializeSocketHandlers(io: TypedServer): void {
  io.on('connection', (socket: TypedSocket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join a specific card room
    socket.on('joinCard', (cardId: string) => {
      socket.join(`card:${cardId}`);
      console.log(`👤 Socket ${socket.id} joined card:${cardId}`);
    });

    // Leave a card room
    socket.on('leaveCard', (cardId: string) => {
      socket.leave(`card:${cardId}`);
      console.log(`👋 Socket ${socket.id} left card:${cardId}`);
    });

    // Join a board room (for future board-level updates)
    socket.on('joinBoard', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`📋 Socket ${socket.id} joined board:${boardId}`);
    });

    // Leave a board room
    socket.on('leaveBoard', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`📋 Socket ${socket.id} left board:${boardId}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket ${socket.id} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`🔴 Socket ${socket.id} error:`, error);
    });
  });

  // Log total connections periodically (optional)
  setInterval(() => {
    const socketCount = io.sockets.sockets.size;
    if (socketCount > 0) {
      console.log(`📊 Active socket connections: ${socketCount}`);
    }
  }, 60000); // Every minute
}
