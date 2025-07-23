import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { UserLevelSession } from '../../models/UserLevelSession';
import { Question } from '../../models/Questions';
import { QuestionTs } from '../../models/QuestionTs';
import { UserChapterLevel } from '../../models/UserChapterLevel';
import { Level } from '../../models/Level';
import { UserLevelSessionTopicsLogs } from '../../models/Performance/UserLevelSessionTopicsLogs';
import { getSkewNormalRandom } from '../../utils/math';

import { UserProfile } from '../../models/UserProfile';
import Badge from '../../models/Badge';
import axios from 'axios';
import mongoose from 'mongoose';

// Helper function to replenish question bank
const replenishQuestionBank = async (session: any, level: any) => {
  const replenishmentSize = Math.ceil(session.questionBank.length * 0.5); // 50% of current bank size
  const newQuestions: any[] = [];
  
  // Generate difficulty using same parameters as initial load
  const difficulty = getSkewNormalRandom(
    level.difficultyParams.mean,
    level.difficultyParams.sd,
    level.difficultyParams.alpha
  );

  // Get allowed topic IDs for this level (fetch Topic docs for names)
  const topicDocs = await require('../../models/Topic').Topic.find({ topic: { $in: level.topics } });
  const levelTopicIds = topicDocs.map((t: any) => t._id.toString());

  // Strategy 1: Get questions based on difficulty and topic subset
  let difficultyQuestions = await QuestionTs.find({
    'difficulty.mu': { $gte: difficulty },
    'quesId': { $nin: session.questionBank }
  })
  .populate('quesId')
  .sort({ 'difficulty.mu': 1 })
  .limit(replenishmentSize);
  newQuestions.push(...difficultyQuestions.filter(qt => {
    if (!qt.quesId || typeof qt.quesId !== 'object' || !('topics' in qt.quesId) || !Array.isArray(qt.quesId.topics) || !qt.quesId.topics.length) return false;
    const topicIds = qt.quesId.topics.map((t: any) => t.id.toString());
    return topicIds.length >= 1 && topicIds.every((id: string) => levelTopicIds.includes(id));
  }));

  // Strategy 2: If not enough, add wrong questions from user history (with topic filter)
  if (newQuestions.length < replenishmentSize && session.questionsAnswered.incorrect.length > 0) {
    const wrongQuestionsNeeded = replenishmentSize - newQuestions.length;
    const wrongQuestionIds = session.questionsAnswered.incorrect.filter(
      (id: any) => !session.questionBank.includes(id)
    );
    
    if (wrongQuestionIds.length > 0) {
      const wrongQuestions = await QuestionTs.find({
        'quesId': { $in: wrongQuestionIds.slice(0, wrongQuestionsNeeded) }
      })
      .populate('quesId');
      newQuestions.push(...wrongQuestions.filter(qt => {
        if (!qt.quesId || typeof qt.quesId !== 'object' || !('topics' in qt.quesId) || !Array.isArray(qt.quesId.topics) || !qt.quesId.topics.length) return false;
        const topicIds = qt.quesId.topics.map((t: any) => t.id.toString());
        return topicIds.length >= 1 && topicIds.every((id: string) => levelTopicIds.includes(id));
      }));
    }
  }

  // Strategy 3: If still not enough, add correct questions from user history (with topic filter)
  if (newQuestions.length < replenishmentSize && session.questionsAnswered.correct.length > 0) {
    const correctQuestionsNeeded = replenishmentSize - newQuestions.length;
    const correctQuestionIds = session.questionsAnswered.correct.filter(
      (id: any) => !session.questionBank.includes(id)
    );
    
    if (correctQuestionIds.length > 0) {
      const correctQuestions = await QuestionTs.find({
        'quesId': { $in: correctQuestionIds.slice(0, correctQuestionsNeeded) }
      })
      .populate('quesId');
      newQuestions.push(...correctQuestions.filter(qt => {
        if (!qt.quesId || typeof qt.quesId !== 'object' || !('topics' in qt.quesId) || !Array.isArray(qt.quesId.topics) || !qt.quesId.topics.length) return false;
        const topicIds = qt.quesId.topics.map((t: any) => t.id.toString());
        return topicIds.length >= 1 && topicIds.every((id: string) => levelTopicIds.includes(id));
      }));
    }
  }

  // Strategy 4: If still not enough, add random questions (with topic filter)
  if (newQuestions.length < replenishmentSize) {
    const randomQuestionsNeeded = replenishmentSize - newQuestions.length;
    const existingQuestionIds = [...session.questionBank, ...newQuestions.map(q => q.quesId._id ? q.quesId._id : q.quesId)];
    const randomQuestions = await QuestionTs.aggregate([
      { $match: { 'quesId': { $nin: existingQuestionIds } } },
      { $lookup: {
          from: 'questions',
          localField: 'quesId',
          foreignField: '_id',
          as: 'quesObj'
      }},
      { $unwind: '$quesObj' },
      { $sample: { size: randomQuestionsNeeded } }
    ]);
    // Attach quesId for consistency
    randomQuestions.forEach(q => { q.quesId = q.quesObj; });
    newQuestions.push(...randomQuestions.filter(qt => {
      if (!qt.quesId || typeof qt.quesId !== 'object' || !('topics' in qt.quesId) || !Array.isArray(qt.quesId.topics) || !qt.quesId.topics.length) return false;
      const topicIds = qt.quesId.topics.map((t: any) => t.id.toString());
      return topicIds.length >= 1 && topicIds.every((id: string) => levelTopicIds.includes(id));
    }));
  }

  // Shuffle the new questions and add to bank
  const shuffledQuestions = newQuestions.sort(() => Math.random() - 0.5);
  const newQuestionIds = shuffledQuestions.map(q => q.quesId);
  
  return newQuestionIds;
};

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

      const level = await Level.findById(userLevelId);
      if (!level) {
        throw new Error(`Level not found: ${userLevelId}`);
      }


      const currentQuestionId = session.questionBank[session.currentQuestionIndex];
      const question = await Question.findById(currentQuestionId);

      // Update session with current question
      session.currentQuestion = currentQuestionId;
      await session.save();

      // Send question to client
      socket.emit('question', {
        question: question?.ques,
        options: question?.options,
        correctAnswer: question?.correct,
        topics: question?.topics?.map(t => t.name) || [],
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questionBank.length
      });

      // Check if we need to replenish the question bank (at 40% threshold)
      // Only replenish question bank for time_rush mode
      if (session.attemptType === 'time_rush' && session.currentQuestionIndex >= session.questionBank.length * 0.4) {
          const newQuestions = await replenishQuestionBank(session, level);
          session.questionBank.push(...newQuestions);
          await session.save();
      }
      
      // Get current question from bank
      if (session.currentQuestionIndex >= session.questionBank.length) {
          throw new Error('No more questions available in bank');
      }
      
      if (!question) {
        throw new Error('Question not found');
      }
      
      const endTime = Date.now();
      const timeTaken = endTime - startTime;

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
  socket.on('answer', async ({ userLevelSessionId, answer, currentTime, timeSpent }) => {
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
      
      // Update uniqueTopics in session
      if (question.topics && Array.isArray(question.topics)) {
        const topicIds = question.topics.map(topic => topic.id.toString());
        // Combine existing and new topic IDs, ensure uniqueness using Set
        const allTopicIds = new Set([
          ...((session.uniqueTopics || []).map(id => id.toString())),
          ...topicIds
        ]);
        session.uniqueTopics = Array.from(allTopicIds).map(id => new mongoose.Types.ObjectId(id));
      }

      // Log time spent on this question

      // Phase 1: Create/Update UserLevelSessionTopicsLogs
      try {
        const topicIds = question.topics.map(topic => topic.id);
        
        // Get today's date (start of day for consistency)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await UserLevelSessionTopicsLogs.findOneAndUpdate(
          { 
            userChapterLevelId: session.userChapterLevelId,
            userLevelSessionId,
            topics: topicIds,
            createdAt: { 
              $gte: today, 
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
            }
          },
          {
            $setOnInsert: {
              status: 0,
              createdAt: new Date()
            },
            $push: {
              questionsAnswered: {
                questionId: session.currentQuestion,
                timeSpent,
                userAnswer: answer,
                isCorrect
              }
            }
          },
          { upsert: true }
        );

      } catch (sessionLogError) {
        logger.error('Error updating session topics log:', sessionLogError);
        // Don't break the quiz flow if session logging fails
      }
      
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
      ``
      // Clear current question and increment index
      session.currentQuestion = null;
      session.currentQuestionIndex = (session.currentQuestionIndex || 0) + 1;
      await session.save();

      // Send result to client
      socket.emit('answerResult', {
        isCorrect,
        correctAnswer: question.correct,
        xpEarned: Number(xpEarned),
        currentXp: session.attemptType === 'time_rush' ? 
          session.timeRush.currentXp : 
          session.precisionPath.currentXp,
        totalQuestions: session.questionBank.length
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

          // Process badges and fetch earned badges
          const userProfile = await UserProfile.findOne({ userId: session.userId });
          let earnedBadges: Array<{ badgeId: string, level: number, badgeName: string, badgeImage: string, badgeDescription: string }> = [];
          if (userProfile && userProfile.badges) {
            const sessionBadges = userProfile.badges.filter(b => b.userLevelSessionId === userLevelSessionId);
            for (const badge of sessionBadges) {
              const badgeDoc = await Badge.findById(badge.badgeId);
              if (badgeDoc) {
                earnedBadges.push({ 
                  badgeId: badge.badgeId.toString(), 
                  level: badge.level, 
                  badgeName: badgeDoc.badgeName,
                  badgeImage: badgeDoc.badgelevel?.[badge.level]?.badgeImage || '',
                  badgeDescription: badgeDoc.badgeDescription || ''
                });
              }
            }
          }

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
            xpNeeded: response.data.data.xpNeeded,
            earnedBadges
          });
          socket.disconnect();
        }
      } else if (session.attemptType === 'precision_path' && session.currentQuestionIndex >= session.questionBank.length && currentXp < requiredXp) {
        // For Precision Path: if this was the last question and level not completed, end the quiz
        const response = await axios.post(`${process.env.BACKEND_URL}/api/levels/end`, {
          userLevelSessionId,
          userId: session.userId,
          currentTime: currentTime
        });

        // Process badges and fetch earned badges
        const userProfile = await UserProfile.findOne({ userId: session.userId });
        let earnedBadges: Array<{ badgeId: string, level: number, badgeName: string, badgeImage: string, badgeDescription: string }> = [];
        if (userProfile && userProfile.badges) {
          const sessionBadges = userProfile.badges.filter(b => b.userLevelSessionId === userLevelSessionId);
          for (const badge of sessionBadges) {
            const badgeDoc = await Badge.findById(badge.badgeId);
            if (badgeDoc) {
              earnedBadges.push({ 
                badgeId: badge.badgeId.toString(), 
                level: badge.level, 
                badgeName: badgeDoc.badgeName,
                badgeImage: badgeDoc.badgelevel?.[badge.level]?.badgeImage || '',
                badgeDescription: badgeDoc.badgeDescription || ''
              });
            }
          }
        }

        // Send final results to client
        socket.emit('quizFinished', { 
          message: response.data.message,
          attemptType: session.attemptType,
          precisionPath: {
            currentXp: response.data.data.currentXp,
            requiredXp: response.data.data.requiredXp,
            timeTaken: response.data.data.timeTaken,
            bestTime: response.data.data.bestTime,
            percentile: response.data.data.percentile
          },
          hasNextLevel: response.data.data.hasNextLevel,
          nextLevelNumber: response.data.data.nextLevelNumber,
          xpNeeded: response.data.data.xpNeeded,
          earnedBadges
        });
        socket.disconnect();
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