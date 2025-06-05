import express from 'express';
import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { UserLevelSession } from '../../models/UserLevelSession';
import { Question } from '../../models/Questions';
import { QuestionTs } from '../../models/QuestionTs';
import { UserChapterLevel } from '../../models/UserChapterLevel';
import { Level } from '../../models/Level';
import { getSkewNormalRandom } from '../../utils/math';
import axios from 'axios';


const router = express.Router();

// Socket event handlers
export const quizSocketHandlers = (socket: Socket) => {
  logger.info(`Quiz socket connected: ${socket.id}`);



  // Handle get level session
  socket.on('getLevelSession', async ({ userLevelSessionId }) => {
    try {
      if (!userLevelSessionId) {
        throw new Error('Session ID is required');
      }

      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        logger.warn(`Session not found for ID: ${userLevelSessionId}`);
        socket.emit('quizError', { 
          type: 'failure',
          message: 'Session not found. Please start a new quiz.' 
        });
        return;
      }

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

      socket.emit('levelSession', {
        currentQuestion,
        currentTime: session.currentTime,
        currentXp: session.currentXp
      });

    } catch (error) {
      logger.error('Error getting level session:', error);
      socket.emit('quizError', {
        type: 'failure',
        message: error.message || 'Failed to get level session'
      });
    }
  });

  // Handle time updates
  socket.on('sendUpdateTime', async ({ currentTime , userLevelSessionId}) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Validate current time is not lower than stored time
      if (currentTime > session.currentTime) {
        throw new Error('Invalid time update: current time cannot be greater than stored time');
      }

      // Update current time and set expiration based on remaining time
      session.currentTime = currentTime;
      const remainingTime = (session.totalTime - currentTime) * 1000; // Convert to milliseconds
      const baseTime = session.reconnectExpiresAt ? session.reconnectExpiresAt.getTime() : Date.now();
      session.reconnectExpiresAt = new Date(baseTime + remainingTime + 20000);
      
      await session.save();
      
    } catch (error) {
      logger.error('Error updating time:', error);
      socket.emit('quizError', { 
        type: 'error',
        message: error.message || 'Failed to update time' 
      });
    }
  });

  // Handle question submission
  socket.on('question', async ({ userLevelSessionId, userLevelId }) => {
    try {
      const startTime = Date.now();
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      console.log('userLevelId',userLevelId);
      const level = await Level.findById(userLevelId);
      if (!level) {
        throw new Error(`Level not found: ${userLevelId}`);
      }

      // Generate difficulty using skew normal distribution
      const difficulty = getSkewNormalRandom(
        level.difficultyParams.mean,
        level.difficultyParams.sd,
        level.difficultyParams.alpha
      );

      const questionTs = await QuestionTs.findOne({
        'difficulty.mu': { $gte: difficulty }
      }).sort({ 'difficulty.mu': 1 }).populate('quesId');

      if (!questionTs) {
        throw new Error('Question not found');
      }

      const question = await Question.findById(questionTs.quesId);
      logger.info(`User asked question for userLevelSessionId ${userLevelSessionId}`);

      // Update the current question in the session
      session.currentQuestion = questionTs.quesId;
      await session.save();

      // Emit response to user
      socket.emit('question', {
        question: question?.ques,
        options: question?.options,
        correctAnswer: question?.correct
      });
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      console.log('timeTaken seconds',timeTaken/1000);

    } catch (error) {
      logger.error('Error in question:', error);
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

  // Handle answer submission
  socket.on('answer', async ({ userLevelSessionId, answer }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.currentQuestion) {
        throw new Error('No active question found');
      }

      const question = await Question.findById(session.currentQuestion);
      if (!question) {
        throw new Error('Question not found');
      }

      const isCorrect = answer === question.correct;
      
      // Find the QuestionTs document
      const questionTs = await QuestionTs.findOne({ quesId: session.currentQuestion });
      if (!questionTs) {
        throw new Error('QuestionTs not found');
      }

      // Update XP based on answer
      const xpEarned = isCorrect ? questionTs.xp.correct : questionTs.xp.incorrect;
      
      // Update session's currentXp, ensuring it's a number
      session.currentXp = (session.currentXp || 0) + Number(xpEarned);
      
      // Clear current question
      session.currentQuestion = null;
      await session.save();

      // Emit response to user
      socket.emit('answerResult', {
        isCorrect,
        correctAnswer: question.correct,
        xpEarned: Number(xpEarned),
        currentXp: Number(session.currentXp)
      });

      if(session.status === 0 && session.currentXp >= session.requiredXp){
        const userChapterLevel = await UserChapterLevel.findByIdAndUpdate(session.userChapterLevelId, {
          status: 'completed'
        });
        if (!userChapterLevel) {
          throw new Error('UserChapterLevel not found');
        }
        await UserLevelSession.findOneAndUpdate({_id: session._id}, {
          status: 1
        });
        console.log('Level completed',session._id);
        socket.emit('levelCompleted', { 
          message: 'Level has been completed.',
        });
      }

    } catch (error) {
      logger.error('Error in answer submission:', error);
      socket.emit('quizError', {
        type: 'error',
        message: error.message || 'Failed to process answer'
      });
    }
  });

  // Handle quiz end
  socket.on('sendQuizEnd', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Call the end API
      const response = await axios.post(`${process.env.BACKEND_URL}/api/levels/end`, {
        userLevelSessionId,
        userId: session.userId
      });

      // Emit quiz finished event with API response data
      socket.emit('quizFinished', { 
        message: response.data.message,
        currentXp: response.data.data.currentXp,
        requiredXp: response.data.data.requiredXp,
        maxXp: response.data.data.maxXp,
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

  // Handle time up
  socket.on('sendTimesUp', async ({ userLevelSessionId }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Call the end API
      const response = await axios.post(`${process.env.BACKEND_URL}/api/levels/end`, {
        userLevelSessionId,
        userId: session.userId
      });

      // Emit quiz finished event with API response data
      socket.emit('quizFinished', { 
        message: response.data.message,
        currentXp: response.data.data.currentXp,
        requiredXp: response.data.data.requiredXp,
        maxXp: response.data.data.maxXp,
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

export default router;
