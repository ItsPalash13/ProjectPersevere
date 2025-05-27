import express, { Request, Response, RequestHandler } from 'express';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import authMiddleware from '../middleware/authMiddleware';
import { UserLevelSession } from '../models/UserLevelSession';
import { Question } from '../models/Questions';
import { QuestionTs } from '../models/QuestionTs';
import { UserChapterLevel } from '../models/UserChapterLevel';
import { Level } from '../models/Level';
interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

const router = express.Router();

async function getOneSampleFromPDF(expression: string, xMin: number, xMax: number) {
  try {
    const evaluatePDF = Function('x', `return ${expression};`);

    // Estimate the max value of the PDF (normally at the mean for normal dist)
    const midPoint = (xMin + xMax) / 2;
    const peak = evaluatePDF(midPoint);
  

    if (isNaN(peak)) {
      throw new Error(`Invalid PDF evaluation at midpoint: ${peak}`);
    }

    while (true) {
      const x = Math.random() * (xMax - xMin) + xMin;
      const y = Math.random() * peak;
      const pdfValue = evaluatePDF(x);

      if (isNaN(pdfValue)) {
        throw new Error(`Invalid PDF evaluation at x=${x}: ${pdfValue}`);
      }

      if (y <= pdfValue) {
        return x;
      }
    }
  } catch (error) {
    logger.error('Error in getOneSampleFromPDF:', error);
    throw error;
  }
}

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
      socket.emit('quizError', { 
        type: 'error',
        message: error.message || 'Failed to update time' 
      });
    }
  });

  // Handle question submission
  socket.on('question', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      const userChapterLevel = await UserChapterLevel.findById(session.userChapterLevelId);
      if (!userChapterLevel) {
        throw new Error('UserChapterLevel not found');
      }
      const level = await Level.findById(userChapterLevel.levelId);
      if (!level) {
        throw new Error(`Level not found: ${userChapterLevel.levelId}`);
      }
      const difficulty = await getOneSampleFromPDF(level.expression, level.xMin, level.xMax);
      const questionTs = await QuestionTs.findOne({
        'difficulty.mu': { $gte: difficulty }
      }).sort({ 'difficulty.mu': 1 }).populate('quesId');

      if (!questionTs) {
        throw new Error('Question not found');
      }

      const question = await Question.findById(questionTs.quesId);
      logger.info(`User asked question for userLevelSessionId ${userLevelSessionId}`);

      // Emit response to user
      socket.emit('question', {
        question: question?.ques,
        options: question?.options,
        correctAnswer: question?.correct
      });

    } catch (error) {
      logger.error('Error submitting answer:', error);
      if (error.message.includes('not found')) {
        socket.emit('quizError', { 
          type: 'failure',
          message: 'Quiz session is invalid. Please start a new quiz.' 
        });
      } else {
        socket.emit('quizError', { 
          type: 'error',
          message: error.message || 'Failed to get question' 
        });
      }
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
      socket.disconnect();

    } catch (error) {
      logger.error('Error ending quiz:', error);
      socket.emit('quizError', { 
        type: 'failure',
        message: error.message || 'Failed to end quiz' 
      });
    }
  });
};

export default router;
