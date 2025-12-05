import { Server } from 'socket.io';
import logger from '../config/logger';

export function initializeSocketHandlers(io: Server): void {
  io.on('connection', (socket) => {
    logger.info(`✅ Socket connected: ${socket.id}`);

    socket.on('joinCard', (cardId: string) => {
      socket.join(`card:${cardId}`);
      logger.debug(`👤 Socket ${socket.id} joined card:${cardId}`);
    });

    socket.on('leaveCard', (cardId: string) => {
      socket.leave(`card:${cardId}`);
      logger.debug(`👋 Socket ${socket.id} left card:${cardId}`);
    });

    socket.on('joinBoard', (boardId: string) => {
      socket.join(`board:${boardId}`);
      logger.debug(`📋 Socket ${socket.id} joined board:${boardId}`);
    });

    socket.on('leaveBoard', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      logger.debug(`📋 Socket ${socket.id} left board:${boardId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`❌ Socket ${socket.id} disconnected: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`🔴 Socket ${socket.id} error:`, error);
    });

        socket.on('memberAdded', ({ cardId, member }) => {
      socket.to(`card:${cardId}`).emit('memberAdded', { cardId, member });
    });

    socket.on('memberRemoved', ({ cardId, userId }) => {
      socket.to(`card:${cardId}`).emit('memberRemoved', { cardId, userId });
    });
  });

  // Log connection stats every minute
  setInterval(() => {
    const socketCount = io.sockets.sockets.size;
    if (socketCount > 0) {
      logger.info(`📊 Active socket connections: ${socketCount}`);
    }
  }, 60000);
}
