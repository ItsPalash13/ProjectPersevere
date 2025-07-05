import { Server } from 'socket.io';
import { quizSessionHandlers } from './quiz/quiz-session';
import { quizQuestionHandlers } from './quiz/quiz-questions';
import { UserLevelSession } from '../models/UserLevelSession';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const initializeSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    // Initialize quiz handlers
    quizSessionHandlers(socket);
    quizQuestionHandlers(socket);

    // Handle ping
    socket.on('ping', () => {
      logger.info('Ping received from:', socket.id);
      socket.emit('pong');
    });     

    // Handle disconnection
    socket.on('disconnect', async () => {     
      logger.info(`Socket disconnected: ${socket.id}`);
      if (socket.data?.user?.id) {
        const userLevelSession = await UserLevelSession.findOne({
          userId: new mongoose.Types.ObjectId(socket.data.user.id),
        });
        let reconnectCount = 0;
        if (userLevelSession) {
          reconnectCount = userLevelSession.reconnectCount;
        }
        if (userLevelSession && reconnectCount < 2) {
          await UserLevelSession.findOneAndUpdate(
            { 
              userId: new mongoose.Types.ObjectId(socket.data.user.id),
            },
            { 
              reconnectExpiresAt: Date.now() + 1000 * 15, // 15 seconds
              reconnectCount: reconnectCount + 1
            }
          );
        }
        else{
          await UserLevelSession.deleteOne(
            { 
              userId: new mongoose.Types.ObjectId(socket.data.user.id),
            },
          );
        }
      } else {
        logger.info(`User not found`);
      }
    });
  });
};
