import express, { Request, Response, RequestHandler } from 'express';
import { Level } from '../models/Level';
import { UserChapterLevel } from '../models/UserChapterLevel';
import { UserLevelSession } from '../models/UserLevelSession';
import { QuestionTs } from '../models/QuestionTs';
import { Question } from '../models/Questions';
import authMiddleware from '../middleware/authMiddleware';
import mongoose, { Document } from 'mongoose';
import { getSkewNormalRandom } from '../utils/math';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

interface ILevel extends Document {
  _id: string;
  name: string;
  description: string;
  requiredXp: number;
  topics: string[];
  status: boolean;
}

const router = express.Router();

// Start a level
router.post('/start', authMiddleware, (async (req: AuthRequest, res: Response) => {
  try {
    const { levelId, attemptType } = req.body;
    const userId = req.user.id;

    if (!attemptType || !['time_rush', 'precision_path'].includes(attemptType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attempt type. Must be either time_rush or precision_path'
      });
    }

    // Find the level
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({
        success: false,
        error: 'Level not found'
      });
    }

    // Find or create UserChapterLevel
    let userChapterLevel = await UserChapterLevel.findOneAndUpdate({
      userId,
      levelId,
      chapterId: level.chapterId,
      attemptType
    }, {
      $inc: {
        [`${attemptType}.attempts`]: 1
      },
      $set: {
        lastAttemptedAt: new Date()
      }
    });

    // Delete all existing sessions for this userChapterLevelId
    if (userChapterLevel) {
      await UserLevelSession.deleteMany({
        userChapterLevelId: userChapterLevel._id
      });
    }

    // Generate difficulty using skew normal distribution
    const difficulty = getSkewNormalRandom(
      level.difficultyParams.mean,
      level.difficultyParams.sd,
      level.difficultyParams.alpha
    );

    // Get 10 questions based on difficulty
    const questionTsList = await QuestionTs.find({
      'difficulty.mu': { $gte: difficulty }
    })
    .sort({ 'difficulty.mu': 1 })
    .limit(10)
    .populate('quesId');

    if (!questionTsList.length) {
      throw new Error('No suitable questions found');
    }

    // Extract question IDs for the question bank
    const questionBank = questionTsList.map(qt => qt.quesId);

    console.log((attemptType === 'time_rush' ? {
      timeRush: {
        requiredXp: level.requiredXp,
        currentXp: 0,
        maxXp: userChapterLevel?.timeRush?.maxXp || 0,
        timeLimit: level.totalTime,
        currentTime: level.totalTime
      }
    } : {
      precisionPath: {
        requiredXp: level.requiredXp,
        currentXp: 0,
        currentTime: 0,
        minTime: userChapterLevel?.precisionPath?.minTime || Infinity
      }
    }));
    // Create new session with question bank
    const session = await UserLevelSession.create({
      userChapterLevelId: userChapterLevel?._id,
      userId,
      chapterId: level.chapterId,
      levelId: level._id,
      attemptType,
      status: 0,
      reconnectCount: 0,
      currentQuestion: null,
      ...(attemptType === 'time_rush' ? {
        timeRush: {
          requiredXp: userChapterLevel?.timeRush?.requiredXp || 0,
          currentXp: 0,
          maxXp: userChapterLevel?.timeRush?.maxXp || 0,
          timeLimit: level.totalTime,
          currentTime: level.totalTime
        }
      } : {
        precisionPath: {
          requiredXp: userChapterLevel?.precisionPath?.requiredXp || 0,
          currentXp: 0,
          currentTime: 0,
          minTime: userChapterLevel?.precisionPath?.minTime || Infinity
        }
      }),
      questionBank
    });

    // Get the first question details
    const firstQuestion = await Question.findById(questionBank[0]);
    if (!firstQuestion) {
      throw new Error('Question not found');
    }

    console.log('New session created with question bank');
    return res.status(201).json({
      success: true,
      data: {
        session,
        currentQuestion: {
          question: firstQuestion.ques,
          options: firstQuestion.options,
          correctAnswer: firstQuestion.correct
        },
        totalQuestions: questionBank.length
      }
    });
  } catch (error) {
    console.error('Error starting level:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
}) as unknown as RequestHandler);

// Get levels by chapter ID
router.get('/:chapterId', authMiddleware, (async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;
    
    const levels = await Level.find({ chapterId })
      .select('name description requiredXp topics status timeRushTime')
      .sort({ createdAt: 1 }) as ILevel[];

    if (!levels.length) {
      return res.status(404).json({
        success: false,
        error: 'No levels found for this chapter'
      });
    }

    // Get user progress for these levels for both modes
    const userProgress = await UserChapterLevel.find({
        userId: new mongoose.Types.ObjectId(userId),
        chapterId: new mongoose.Types.ObjectId(chapterId),
        levelId: { $in: levels.map(level => new mongoose.Types.ObjectId(level._id)) }
      });

    // Get active sessions for this chapter
    const activeSessions = await UserLevelSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      chapterId: new mongoose.Types.ObjectId(chapterId)
    });

    // Create maps for progress and sessions
    const progressMap = new Map(
      userProgress.map(progress => [`${progress.levelId.toString()}_${progress.attemptType}`, progress])
    );

    const sessionMap = new Map(
      activeSessions.map(session => [`${session.levelId.toString()}_${session.attemptType}`, session])
    );

    // Process levels for both modes
    const timeRushLevels = levels.map(level => {
      const progressKey = `${level._id.toString()}_time_rush`;
      const hasProgress = progressMap.has(progressKey);
      const isAvailable = level.status && hasProgress;
      const activeSession = sessionMap.get(progressKey);
      
      return {
        ...level.toObject(),
        userProgress: progressMap.get(progressKey) || null,
        isStarted: hasProgress,
        status: isAvailable,
        activeSession: activeSession || null,
        mode: 'time_rush'
      };
    });

    const precisionPathLevels = levels.map(level => {
      const progressKey = `${level._id.toString()}_precision_path`;
      const hasProgress = progressMap.has(progressKey);
      const isAvailable = level.status && hasProgress;
      const activeSession = sessionMap.get(progressKey);
      
      return {
        ...level.toObject(),
        userProgress: progressMap.get(progressKey) || null,
        isStarted: hasProgress,
        status: isAvailable,
        activeSession: activeSession || null,
        mode: 'precision_path'
      };
    });

    return res.status(200).json({
      success: true,
      count: {
        total: levels.length,
        timeRush: timeRushLevels.length,
        precisionPath: precisionPathLevels.length
      },
      data: {
        timeRush: timeRushLevels,
        precisionPath: precisionPathLevels
      }
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}) as unknown as RequestHandler);

// End a level
router.post('/end', (async (req: Request, res: Response) => {
  try {
    const { userLevelSessionId, userId, currentTime } = req.body;
    
    if (!userId || !userLevelSessionId) {
      return res.status(400).json({
        success: false,
        error: 'userId and userLevelSessionId are required'
      });
    }

    // Find the session
    const session = await UserLevelSession.findById(userLevelSessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get current UserChapterLevel
    const userChapterLevel = await UserChapterLevel.findOne({
      userId,
      chapterId: session.chapterId,
      levelId: session.levelId,
      attemptType: session.attemptType
    });

    let highScoreMessage = '';
    let newHighScore = false;

    if (session.attemptType === 'time_rush') {
      // Time Rush: Check if current XP exceeds max XP
      const currentXp = session.timeRush?.currentXp || 0;
      const maxXp = userChapterLevel?.timeRush?.maxXp || 0;
      
      if (currentXp > maxXp) {
        newHighScore = true;
        highScoreMessage = `New high score achieved: ${currentXp} XP!`;
      }

      // Check if user has enough XP
      if (currentXp >= (session.timeRush?.requiredXp || 0)) {
        // Find the current level
        const currentLevel = await Level.findById(session.levelId);
        if (!currentLevel) {
          throw new Error('Level not found');
        }

        // Find the next level in the same chapter
        const nextLevel = await Level.findOne({
          chapterId: session.chapterId,
          levelNumber: currentLevel.levelNumber + 1
        }).select('_id levelNumber');

        // Update UserChapterLevel for current level
        await UserChapterLevel.findOneAndUpdate(
          {
            userId,
            chapterId: session.chapterId,
            levelId: session.levelId,
            attemptType: 'time_rush'
          },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              'timeRush.maxXp': Math.max(currentXp, maxXp)
            }
          },
          { upsert: true }
        );

        // If next level exists, create UserChapterLevel for it
        if (nextLevel && typeof nextLevel.levelNumber === 'number' && !isNaN(nextLevel.levelNumber)) {
          await UserChapterLevel.findOneAndUpdate(
            {
              userId,
              chapterId: session.chapterId,
              levelId: nextLevel._id,
              attemptType: 'time_rush'
            },
            {
              $set: {
                status: 'not_started',
                levelNumber: nextLevel.levelNumber,
                'timeRush.maxXp': 0
              }
            },
            { upsert: true }
          );
        }

        // Delete the session
        await UserLevelSession.findByIdAndDelete(userLevelSessionId);

        return res.status(200).json({
          success: true,
          message: highScoreMessage ? 
            `Level completed successfully! You have unlocked the next level. ${highScoreMessage}` :
            'Level completed successfully! You have unlocked the next level.',
          data: {
            currentXp,
            requiredXp: session.timeRush?.requiredXp,
            maxXp: Math.max(currentXp, maxXp),
            hasNextLevel: !!nextLevel,
            nextLevelNumber: nextLevel?.levelNumber,
            isNewHighScore: newHighScore
          }
        });
      } else {
        // Update maxXp even if level not completed
        if (currentXp > maxXp) {
          await UserChapterLevel.findOneAndUpdate(
            {
              userId,
              chapterId: session.chapterId,
              levelId: session.levelId,
              attemptType: 'time_rush'
            },
            {
              $set: {
                'timeRush.maxXp': currentXp
              }
            },
            { upsert: true }
          );
        }

        // Delete the session
        await UserLevelSession.findByIdAndDelete(userLevelSessionId);

        return res.status(200).json({
          success: true,
          message: highScoreMessage ? 
            `Level ended. You need more XP to complete this level. ${highScoreMessage}` :
            'Level ended. You need more XP to complete this level.',
          data: {
            currentXp,
            requiredXp: session.timeRush?.requiredXp,
            maxXp: Math.max(currentXp, maxXp),
            xpNeeded: (session.timeRush?.requiredXp || 0) - currentXp,
            isNewHighScore: newHighScore
          }
        });
      }
    } else {
      // Precision Path: Check if current time is better than min time
      const finalTime = currentTime || session.precisionPath?.currentTime || 0;
      const minTime = userChapterLevel?.precisionPath?.minTime || Infinity;
      const currentXp = session.precisionPath?.currentXp || 0;
      
      // Check if user has enough XP
      if (currentXp >= (session.precisionPath?.requiredXp || 0)) {
        // Level completed - check and update best time
        if (finalTime < minTime) {
          newHighScore = true;
          highScoreMessage = `New best time: ${Math.floor(finalTime / 60)}:${(finalTime % 60).toString().padStart(2, '0')}!`;
        }

        // Find the current level
        const currentLevel = await Level.findById(session.levelId);
        if (!currentLevel) {
          throw new Error('Level not found');
        }

        // Find the next level in the same chapter
        const nextLevel = await Level.findOne({
          chapterId: session.chapterId,
          levelNumber: currentLevel.levelNumber + 1
        }).select('_id levelNumber');

        // Update UserChapterLevel for current level
        await UserChapterLevel.findOneAndUpdate(
          {
            userId,
            chapterId: session.chapterId,
            levelId: session.levelId,
            attemptType: 'precision_path'
          },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              'precisionPath.minTime': Math.min(finalTime, minTime)
            }
          },
          { upsert: true }
        );

        // If next level exists, create UserChapterLevel for it
        if (nextLevel && typeof nextLevel.levelNumber === 'number' && !isNaN(nextLevel.levelNumber)) {
          await UserChapterLevel.findOneAndUpdate(
            {
              userId,
              chapterId: session.chapterId,
              levelId: nextLevel._id,
              attemptType: 'precision_path'
            },
            {
              $set: {
                status: 'not_started',
                levelNumber: nextLevel.levelNumber,
                'precisionPath.minTime': 99999999
              }
            },
            { upsert: true }
          );
        }

        // Delete the session
        await UserLevelSession.findByIdAndDelete(userLevelSessionId);

        return res.status(200).json({
          success: true,
          message: highScoreMessage ? 
            `Level completed successfully! You have unlocked the next level. ${highScoreMessage}` :
            'Level completed successfully! You have unlocked the next level.',
          data: {
            currentXp,
            requiredXp: session.precisionPath?.requiredXp,
            timeTaken: finalTime,
            bestTime: Math.min(finalTime, minTime),
            hasNextLevel: !!nextLevel,
            nextLevelNumber: nextLevel?.levelNumber,
            isNewHighScore: newHighScore
          }
        });
      } else {
        // Level not completed - don't update best time
        // Delete the session
        await UserLevelSession.findByIdAndDelete(userLevelSessionId);

        return res.status(200).json({
          success: true,
          message: 'Level ended. You need more XP to complete this level.',
          data: {
            currentXp,
            requiredXp: session.precisionPath?.requiredXp,
            timeTaken: finalTime,
            bestTime: minTime,
            xpNeeded: (session.precisionPath?.requiredXp || 0) - currentXp
          }
        });
      }
    }
  } catch (error) {
    console.error('Error ending level:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
}) as unknown as RequestHandler);

export default router; 