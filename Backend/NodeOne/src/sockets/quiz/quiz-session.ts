import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { UserLevelSession } from '../../models/UserLevelSession';
import { Question } from '../../models/Questions';
import { UserChapterLevel } from '../../models/UserChapterLevel';
import axios from 'axios';

// Extend Socket interface to include session tracking
interface ExtendedSocket extends Socket {
  userLevelSessionId?: string;
}

// Socket event handlers for quiz session management
export const quizSessionHandlers = (socket: ExtendedSocket) => {
  logger.info(`Quiz session socket connected: ${socket.id}`);

  // Handle initial level session retrieval
  // This is called when a user starts or reconnects to a quiz
  socket.on('getLevelSession', async ({ userLevelSessionId }) => {
    try {
      if (!userLevelSessionId) {
        throw new Error('Session ID is required');
      }

      // Store session ID for disconnect handling
      socket.userLevelSessionId = userLevelSessionId;

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

  // Handle session deletion when back button is confirmed
  // Called when user confirms they want to leave the quiz
  socket.on('sendDeleteSession', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Delete the session
      await UserLevelSession.findByIdAndDelete(userLevelSessionId);
      logger.info(`Session deleted by user: ${userLevelSessionId}`);

      // Confirm deletion to client
      socket.emit('sessionDeleted', { 
        message: 'Quiz session has been deleted successfully.' 
      });
      socket.disconnect();

    } catch (error) {
      logger.error('Error deleting session:', error);
      socket.emit('quizError', { 
        type: 'failure',
        message: error.message || 'Failed to delete session' 
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

  // Handle socket disconnection
  // Basic cleanup on disconnect (no reconnect logic)
  socket.on('disconnect', async () => {
    try {
      logger.info(`Quiz session socket disconnected: ${socket.id}`);
      
      if (socket.userLevelSessionId) {
        logger.info(`Session ${socket.userLevelSessionId} disconnected - no reconnect logic`);
      }
      
    } catch (error) {
      logger.error('Error handling socket disconnect:', error);
    }
  });
}; 