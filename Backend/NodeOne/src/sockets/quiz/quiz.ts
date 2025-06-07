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

// Socket event handlers for quiz functionality
export const quizSocketHandlers = (socket: Socket) => {
  logger.info(`Quiz socket connected: ${socket.id}`);

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

  // Handle question requests
  // Generates a new question based on level difficulty
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
      // This ensures questions are appropriately challenging
      const difficulty = getSkewNormalRandom(
        level.difficultyParams.mean,
        level.difficultyParams.sd,
        level.difficultyParams.alpha
      );

      // Find a question matching the generated difficulty
      const questionTs = await QuestionTs.findOne({
        'difficulty.mu': { $gte: difficulty }
      }).sort({ 'difficulty.mu': 1 }).populate('quesId');

      if (!questionTs) {
        throw new Error('Question not found');
      }

      const question = await Question.findById(questionTs.quesId);
      logger.info(`User asked question for userLevelSessionId ${userLevelSessionId}`);

      // Update session with new question
      session.currentQuestion = questionTs.quesId;
      await session.save();

      // Send question to client
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
  // Processes user's answer and updates XP
  socket.on('answer', async ({ userLevelSessionId, answer, currentTime }) => {
    try {
      const session = await UserLevelSession.findById(userLevelSessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.currentQuestion) {
        throw new Error('No active question found');
      }

      // Verify answer correctness
      const question = await Question.findById(session.currentQuestion);
      if (!question) {
        throw new Error('Question not found');
      }

      const isCorrect = answer === question.correct;
      
      // Get question details for XP calculation
      const questionTs = await QuestionTs.findOne({ quesId: session.currentQuestion });
      if (!questionTs) {
        throw new Error('QuestionTs not found');
      }

      // Calculate XP earned
      const xpEarned = isCorrect ? questionTs.xp.correct : questionTs.xp.incorrect;
      
      // Update XP based on game mode
      if (session.attemptType === 'time_rush') {
        session.timeRush.currentXp = (session.timeRush.currentXp || 0) + Number(xpEarned);
      } else {
        session.precisionPath.currentXp = (session.precisionPath.currentXp || 0) + Number(xpEarned);
      }
      
      // Track answered questions
      if (!session.questionsAnswered) {
        session.questionsAnswered = { correct: [], incorrect: [] };
      }
      if (isCorrect) {
        session.questionsAnswered.correct.push(session.currentQuestion);
      } else {
        session.questionsAnswered.incorrect.push(session.currentQuestion);
      }
      
      // Clear current question
      session.currentQuestion = null;
      await session.save();

      // Send result to client
      socket.emit('answerResult', {
        isCorrect,
        correctAnswer: question.correct,
        xpEarned: Number(xpEarned),
        currentXp: session.attemptType === 'time_rush' ? 
          session.timeRush.currentXp : 
          session.precisionPath.currentXp
      });

      // Check for level completion
      const currentXp = session.attemptType === 'time_rush' ? 
        session.timeRush.currentXp : 
        session.precisionPath.currentXp;
      const requiredXp = session.attemptType === 'time_rush' ? 
        session.timeRush.requiredXp : 
        session.precisionPath.requiredXp;

      // If level is completed (XP requirement met)
      if (session.status === 0 && currentXp >= requiredXp) {
        // Update user's chapter level status
        const userChapterLevel = await UserChapterLevel.findOneAndUpdate(
          {
            userId: session.userId,
            chapterId: session.chapterId,
            levelId: session.levelId,
            attemptType: session.attemptType
          },
          {
            status: 'completed'
          }
        );
        if (!userChapterLevel) {
          throw new Error('UserChapterLevel not found');
        }
        await UserLevelSession.findOneAndUpdate(
          { _id: session._id },
          { status: 1 }
        );
        console.log('Level completed', session._id);
        if (session.attemptType === 'time_rush') {
          // For Time Rush, notify client to show congrats
          socket.emit('levelCompleted', { 
            message: 'Level has been completed.',
            attemptType: session.attemptType
          });
        } else {
          // For Precision Path, end the quiz and record time
          const response = await axios.post(`${process.env.BACKEND_URL}/api/levels/end`, {
            userLevelSessionId,
            userId: session.userId,
            currentTime: currentTime
          });

          // Send final results to client
          socket.emit('quizFinished', { 
            message: response.data.message,
            attemptType: session.attemptType,
            precisionPath: {
              currentXp: response.data.data.currentXp,
              requiredXp: response.data.data.requiredXp,
              timeTaken: response.data.data.timeTaken,
              bestTime: response.data.data.bestTime
            },
            hasNextLevel: response.data.data.hasNextLevel,
            nextLevelNumber: response.data.data.nextLevelNumber,
            xpNeeded: response.data.data.xpNeeded
          });
          socket.disconnect();
        }
      }

    } catch (error) {
      logger.error('Error in answer submission:', error);
      socket.emit('quizError', {
        type: 'error',
        message: error.message || 'Failed to process answer'
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

export default router;
