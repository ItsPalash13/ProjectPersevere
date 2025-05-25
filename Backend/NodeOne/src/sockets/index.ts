import { Server } from 'socket.io';
import { quizSocketHandlers } from './quiz';
import { UserLevelSession } from '../models/UserLevelSession';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const initializeSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    // Initialize quiz handlers
    quizSocketHandlers(socket);

    // Handle ping
    socket.on('ping', () => {
      logger.info('Ping received from:', socket.id);
      socket.emit('pong');
    });     

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      await UserLevelSession.findOneAndDelete({userId: new mongoose.Types.ObjectId(socket.data.user.id)});
    });
    
    
  });
};
