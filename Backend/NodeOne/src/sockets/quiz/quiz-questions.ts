import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { UserLevelSession } from '../../models/UserLevelSession';
import { Question } from '../../models/Questions';
import { QuestionTs } from '../../models/QuestionTs';
import { UserChapterLevel } from '../../models/UserChapterLevel';
import { Level } from '../../models/Level';
import { getSkewNormalRandom } from '../../utils/math';
import axios from 'axios';

// Socket event handlers for quiz questions and answers
export const quizQuestionHandlers = (socket: Socket) => {
  logger.info(`Quiz question socket connected: ${socket.id}`);

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

      // Find a question with difficulty greater than or equal to the generated difficulty
      let questionTs = await QuestionTs.findOne({
        'difficulty.mu': { $gte: difficulty }
      }).sort({ 'difficulty.mu': 1 }).populate('quesId');

      if (!questionTs) {
        // If no question found with difficulty greater than or equal to the generated difficulty, find one with maximum difficulty less than or equal to the generated difficulty
        questionTs = await QuestionTs.findOne({
          'difficulty.mu': { $lte: difficulty }
        }).sort({ 'difficulty.mu': -1 }).populate('quesId');
        if (!questionTs) {
          throw new Error('Question not found');
        } 
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
}; 