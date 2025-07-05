import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { UserLevelSession } from '../../models/UserLevelSession';
import { Question } from '../../models/Questions';
import { UserChapterLevel } from '../../models/UserChapterLevel';
import axios from 'axios';

// Socket event handlers for quiz session management
export const quizSessionHandlers = (socket: Socket) => {
  logger.info(`Quiz session socket connected: ${socket.id}`);

  // Handle initial level session retrieval
  // This is called when a user starts or reconnects to a quiz
  socket.on('getLevelSession', async ({ userLevelSessionId }) => {
    try {
      if (!userLevelSessionId) {
        throw new Error('Session ID is required');
      }

      // Find the existing session
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        logger.warn(`Session not found for ID: ${userLevelSessionId}`);
        socket.emit('quizError', { 
          type: 'failure',
          message: 'Session not found. Please start a new quiz.' 
        });
        return;
      }

      // If there's a current question, fetch its details
      let currentQuestion = null;
      if (session.currentQuestion) {
        const question = await Question.findById(session.currentQuestion);
        if (question) {
          currentQuestion = {
            ques: question.ques,
            options: question.options,
            correct: question.correct
          };
        }
      }

      // Send session data back to client
      // Include mode-specific data (timeRush or precisionPath)
      socket.emit('levelSession', {
        currentQuestion,
        attemptType: session.attemptType,
        ...(session.attemptType === 'time_rush' ? {
          timeRush: {
            currentTime: session.timeRush.currentTime,
            currentXp: session.timeRush.currentXp,
            timeLimit: session.timeRush.timeLimit
          }
        } : {
          precisionPath: {
            currentTime: session.precisionPath.currentTime,
            currentXp: session.precisionPath.currentXp
          }
        })
      });

    } catch (error) {
      logger.error('Error getting level session:', error);
      socket.emit('quizError', {
        type: 'failure',
        message: error.message || 'Failed to get level session'
      });
    }
  });

  // Handle time updates from client
  // This keeps the server in sync with the client's timer
  socket.on('sendUpdateTime', async ({ currentTime, userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.attemptType === 'time_rush') {
        // Time Rush mode validation:
        // 1. Current time can't be greater than stored time (prevents time manipulation)
        // 2. Current time can't be negative
        if (currentTime > session.timeRush?.currentTime) {
          throw new Error('Invalid time update: current time cannot be greater than stored time');
        }
        if (currentTime < 0) {
          throw new Error('Invalid time update: current time cannot be negative');
        }

        // Update time and set reconnection window
        session.timeRush.currentTime = currentTime;
        const remainingTime = (session.timeRush.timeLimit - currentTime) * 1000; // Convert to milliseconds
        const baseTime = session.reconnectExpiresAt ? session.reconnectExpiresAt.getTime() : Date.now();
        session.reconnectExpiresAt = new Date(baseTime + remainingTime + 20000); // Add 20s buffer
      } else {
        // Precision Path mode validation:
        // Only check for negative time
        if (currentTime < 0) {
          throw new Error('Invalid time update: current time cannot be negative');
        }
        session.precisionPath.currentTime = currentTime;
      }
      
      await session.save();
      
    } catch (error) {
      logger.error('Error updating time:', error);
      socket.emit('quizError', { 
        type: 'error',
        message: error.message || 'Failed to update time' 
      });
    }
  });

  // Handle manual quiz end
  // Called when user clicks "End Quiz" button
  socket.on('sendQuizEnd', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Call the end API to process final results
      const response = await axios.post(`${process.env.BACKEND_URL}/api/levels/end`, {
        userLevelSessionId,
        userId: session.userId
      });

      // Send final results to client
      socket.emit('quizFinished', { 
        message: response.data.message,
        attemptType: session.attemptType,
        ...(session.attemptType === 'time_rush' ? {
          timeRush: {
            currentXp: response.data.data.currentXp,
            requiredXp: response.data.data.requiredXp,
            maxXp: response.data.data.maxXp,
            timeTaken: response.data.data.timeTaken
          }
        } : {
          precisionPath: {
            currentXp: response.data.data.currentXp,
            requiredXp: response.data.data.requiredXp,
            timeTaken: response.data.data.timeTaken,
            bestTime: response.data.data.bestTime
          }
        }),
        hasNextLevel: response.data.data.hasNextLevel,
        nextLevelNumber: response.data.data.nextLevelNumber,
        xpNeeded: response.data.data.xpNeeded
      });
      socket.disconnect();

    } catch (error) {
      logger.error('Error ending quiz:', error);
      socket.emit('quizError', { 
        type: 'failure',
        message: error.message || 'Failed to end quiz' 
      });
    }
  });

  // Handle time up event
  // Called when time runs out in Time Rush mode
  socket.on('sendTimesUp', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Call the end API to process final results
      const response = await axios.post(`${process.env.BACKEND_URL}/api/levels/end`, {
        userLevelSessionId,
        userId: session.userId
      });

      // Send final results to client
      socket.emit('quizFinished', { 
        message: response.data.message,
        attemptType: session.attemptType,
        ...(session.attemptType === 'time_rush' ? {
          timeRush: {
            currentXp: response.data.data.currentXp,
            requiredXp: response.data.data.requiredXp,
            maxXp: response.data.data.maxXp,
            timeTaken: response.data.data.timeTaken
          }
        } : {
          precisionPath: {
            currentXp: response.data.data.currentXp,
            requiredXp: response.data.data.requiredXp,
            timeTaken: response.data.data.timeTaken,
            bestTime: response.data.data.bestTime
          }
        }),
        hasNextLevel: response.data.data.hasNextLevel,
        nextLevelNumber: response.data.data.nextLevelNumber,
        xpNeeded: response.data.data.xpNeeded
      });

    } catch (error) {
      logger.error('Error in time up:', error);
      socket.emit('quizError', { 
        type: 'failure',
        message: error.message || 'Failed to end quiz' 
      });
    }
  });
}; 