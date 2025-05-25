import express, { Request, Response, RequestHandler } from 'express';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import authMiddleware from '../middleware/authMiddleware';
import { UserLevelSession } from '../models/UserLevelSession';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

const router = express.Router();

// Socket event handlers
export const quizSocketHandlers = (socket: Socket) => {
  logger.info(`Quiz socket connected: ${socket.id}`);

  // Handle time updates
  socket.on('sendUpdateTime', async ({ currentTime , userLevelSessionId}) => {
    try {

      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Validate current time is not lower than stored time
      if (currentTime > session.currentTime) {
        throw new Error('Invalid time update: current time cannot be lower than stored time');
      }

      // Update current time
      session.currentTime = currentTime;
      await session.save();
      
      socket.emit('timeUpdated', { 
        currentTime: session.currentTime,
        expiresAt: session.expiresAt
      });

    } catch (error) {
      logger.error('Error updating time:', error);
      socket.emit('quizError', { message: error.message || 'Failed to update time' });
    }
  });

  // Handle question submission
  socket.on('question', async ({ }) => {
    try {
      const userId = socket.data.user.id;
      const userLevelSessionId = socket.data.userLevelSessionId;
      logger.info(`User ${userId} asked question for userLevelSessionId ${userLevelSessionId}`);

      // Emit response to user

    } catch (error) {
      logger.error('Error submitting answer:', error);
      socket.emit('quizError', { message: 'Failed to submit answer' });
    }
  });

  // Handle quiz end
  socket.on('sendQuizEnd', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Delete the session
      await UserLevelSession.findByIdAndDelete(userLevelSessionId);

      // Emit quiz finished event
      socket.emit('quizFinished', { 
        message: 'Time is up! Quiz has ended.',
        currentTime: 0
      });

    } catch (error) {
      logger.error('Error ending quiz:', error);
      socket.emit('quizError', { message: error.message || 'Failed to end quiz' });
    }
  });
};

export default router;
