import express, { Request, Response, RequestHandler } from 'express';
import { Level } from '../models/Level';
import { Chapter } from '../models/Chapter';
import { UserChapterLevel } from '../models/UserChapterLevel';
import { UserLevelSession } from '../models/UserLevelSession';
import { UserChapterLevelPerformanceLogs } from '../models/UserChapterLevelPerformanceLogs';
import { UserLevelSessionTopicsLogs } from '../models/Performance/UserLevelSessionTopicsLogs';
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
  topics: string[];
  status: boolean;
  type: 'time_rush' | 'precision_path';
  timeRush?: {
    requiredXp: number;
    totalTime: number;
  };
  precisionPath?: {
    requiredXp: number;
  };
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

    // Validate that the attemptType matches the level's supported type
    if (level.type !== attemptType) {
      return res.status(400).json({
        success: false,
        error: `This level does not support ${attemptType} mode. It only supports ${level.type} mode.`
      });
    }

    // Find existing UserChapterLevel
    let userChapterLevel = await UserChapterLevel.findOne({
      userId,
      levelId,
      chapterId: level.chapterId,
      attemptType
    });

    // Prepare update object
    const updateObj: any = {
      $set: {
        lastAttemptedAt: new Date()
      }
    };

    // Handle attempts differently for new vs existing documents
    if (!userChapterLevel) {
      // New document - set attempts to 1 and initialize the mode-specific object
      const fieldName = attemptType === 'time_rush' ? 'timeRush' : 'precisionPath';
      updateObj.$set[fieldName] = {
        attempts: 1,
        requiredXp: attemptType === 'time_rush' ? (level.timeRush?.requiredXp || 0) : (level.precisionPath?.requiredXp || 0),
        ...(attemptType === 'time_rush' ? {
          maxXp: null,
          timeLimit: level.timeRush?.totalTime || 0
        } : {
          minTime: null
        })
      };
      updateObj.$set.status = 'in_progress';
    } else {
      // Existing document - update the entire mode-specific object with incremented attempts
      const fieldName = attemptType === 'time_rush' ? 'timeRush' : 'precisionPath';
      const currentAttempts = (userChapterLevel as any)[fieldName]?.attempts || 0;
      const newAttempts = currentAttempts + 1;
      
      // Set the entire object to ensure proper update
      updateObj.$set[fieldName] = {
        ...(userChapterLevel as any)[fieldName],
        attempts: newAttempts
      };
      
      // Only update status to 'in_progress' if it's currently 'not_started'
      if (userChapterLevel.status === 'not_started') {
        updateObj.$set.status = 'in_progress';
      }
    }

    // Update or create UserChapterLevel
    userChapterLevel = await UserChapterLevel.findOneAndUpdate({
      userId,
      levelId,
      chapterId: level.chapterId,
      attemptType
    }, updateObj, {
      new: true, // Return the updated document
      upsert: true // Create if doesn't exist
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

    // Create new session with question bank
    const session = await UserLevelSession.create({
      userChapterLevelId: userChapterLevel?._id,
      userId,
      chapterId: level.chapterId,
      levelId: level._id,
      attemptType,
      status: 0,
      currentQuestion: null,
      ...(attemptType === 'time_rush' ? {
        timeRush: {
          requiredXp: level.timeRush?.requiredXp || 0,
          currentXp: 0,
          maxXp: userChapterLevel?.timeRush?.maxXp || 0,
          timeLimit: level.timeRush?.totalTime || 0,
          currentTime: level.timeRush?.totalTime || 0
        }
      } : {
        precisionPath: {
          requiredXp: level.precisionPath?.requiredXp || 0,
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
      .select('name levelNumber description type timeRush precisionPath topics status')
      .sort({ levelNumber: 1 })
      .lean() as any[];

    if (!levels.length) {
      return res.status(404).json({
        success: false,
        error: 'No levels found for this chapter'
      });
    }

    // Get chapter information
    const chapter = await Chapter.findById(chapterId)
      .select('name description gameName topics status thumbnailUrl');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: 'Chapter not found'
      });
    }

    // Get user progress for these levels for both modes
    const userProgress = await UserChapterLevel.find({
        userId: new mongoose.Types.ObjectId(userId),
        chapterId: new mongoose.Types.ObjectId(chapterId),
        levelId: { $in: levels.map(level => new mongoose.Types.ObjectId(level._id)) }
      });

    // Create maps for progress
    const progressMap = new Map(
      userProgress.map(progress => [`${progress.levelId.toString()}_${progress.attemptType}`, progress])
    );

    // Process levels in mixed sequence - return single array sorted by levelNumber
    const mixedLevels = levels.map(level => {
      const progressKey = `${level._id.toString()}_${level.type}`;
      const hasProgress = progressMap.has(progressKey);
      const isAvailable = level.status && hasProgress;
      const rawProgress = progressMap.get(progressKey);
      
      // Clean user progress to only include relevant fields for the level's type
      let cleanProgress = null;
      if (rawProgress) {
        cleanProgress = {
          ...rawProgress.toObject(),
          // Remove irrelevant mode data based on level type
          ...(level.type === 'time_rush' ? { precisionPath: undefined } : { timeRush: undefined })
        };
      }
      
      return {
        ...level,
        userProgress: cleanProgress,
        isStarted: hasProgress,
        status: isAvailable,
        mode: level.type
      };
    });

    return res.status(200).json({
      success: true,
      count: {
        total: mixedLevels.length,
        timeRush: mixedLevels.filter(level => level.type === 'time_rush').length,
        precisionPath: mixedLevels.filter(level => level.type === 'precision_path').length
      },
      meta: {
        chapter: chapter
      },
      data: mixedLevels
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

    // Save session data to performance logs before processing
    const performanceLogData = {
      userChapterLevelId: session.userChapterLevelId,
      userId: session.userId,
      chapterId: session.chapterId,
      levelId: session.levelId,
      attemptType: session.attemptType,
      currentQuestion: session.currentQuestion,
      questionsAnswered: session.questionsAnswered,
      // Only include the relevant mode data
      ...(session.attemptType === 'time_rush' ? {
        timeRush: session.timeRush,
      } : {
        precisionPath: session.precisionPath,
      })
    };

    await UserChapterLevelPerformanceLogs.create(performanceLogData);

    // Phase 2: Set status to 1 for all session topic logs for this session TODAY
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updateResult = await UserLevelSessionTopicsLogs.updateMany(
        { 
          userChapterLevelId: session.userChapterLevelId,
          userLevelSessionId: userLevelSessionId,
          createdAt: { 
            $gte: today, 
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
          }
        },
        { 
          $set: { status: 1 } 
        }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} session topic logs to status 1`);
    } catch (sessionLogError) {
      console.error('Error updating session topic logs status:', sessionLogError);
      // Don't break the level end flow if session logging fails
    }

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

        // Find the next level in the same chapter with the same type
        const nextLevel = await Level.findOne({
          chapterId: session.chapterId,
          levelNumber: currentLevel.levelNumber + 1
        }).select('_id levelNumber type');

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

        // If next level exists, create UserChapterLevel for it with the correct attemptType
        if (nextLevel && typeof nextLevel.levelNumber === 'number' && !isNaN(nextLevel.levelNumber)) {
          await UserChapterLevel.findOneAndUpdate(
            {
              userId,
              chapterId: session.chapterId,
              levelId: nextLevel._id,
              attemptType: nextLevel.type
            },
            {
              $set: {
                status: 'not_started',
                levelNumber: nextLevel.levelNumber,
                // Set mode-specific fields based on next level's type
                ...(nextLevel.type === 'time_rush' ? {
                  'timeRush.maxXp': null,
                  'timeRush.attempts': 0,
                  'timeRush.requiredXp': nextLevel.timeRush?.requiredXp || 0,
                  'timeRush.timeLimit': nextLevel.timeRush?.totalTime || 0
                } : {
                  'precisionPath.minTime': null,
                  'precisionPath.attempts': 0,
                  'precisionPath.requiredXp': nextLevel.precisionPath?.requiredXp || 0
                })
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
          let totalMilliseconds = Math.floor(finalTime * 1000); // convert to ms
          let minutes = Math.floor(totalMilliseconds / 60000);
          let seconds = Math.floor((totalMilliseconds % 60000) / 1000);
          let milliseconds = totalMilliseconds % 1000;

          let formatted = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
          highScoreMessage = `New best time: ${formatted}!`;
        }

        // Find the current level
        const currentLevel = await Level.findById(session.levelId);
        if (!currentLevel) {
          throw new Error('Level not found');
        }

        // Find the next level in the same chapter with the same type
        const nextLevel = await Level.findOne({
          chapterId: session.chapterId,
          levelNumber: currentLevel.levelNumber + 1
        }).select('_id levelNumber type');

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

        // If next level exists, create UserChapterLevel for it with the correct attemptType
        if (nextLevel && typeof nextLevel.levelNumber === 'number' && !isNaN(nextLevel.levelNumber)) {
          await UserChapterLevel.findOneAndUpdate(
            {
              userId,
              chapterId: session.chapterId,
              levelId: nextLevel._id,
              attemptType: nextLevel.type
            },
            {
              $set: {
                status: 'not_started',
                levelNumber: nextLevel.levelNumber,
                // Set mode-specific fields based on next level's type
                ...(nextLevel.type === 'time_rush' ? {
                  'timeRush.maxXp': null,
                  'timeRush.attempts': 0,
                  'timeRush.requiredXp': nextLevel.timeRush?.requiredXp || 0,
                  'timeRush.timeLimit': nextLevel.timeRush?.totalTime || 0
                } : {
                  'precisionPath.minTime': null,
                  'precisionPath.attempts': 0,
                  'precisionPath.requiredXp': nextLevel.precisionPath?.requiredXp || 0
                })
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