import express, { Request, Response, RequestHandler } from 'express';
import { Level } from '../models/Level';
import { UserChapterLevel } from '../models/UserChapterLevel';
import { UserLevelSession } from '../models/UserLevelSession';
import authMiddleware from '../middleware/authMiddleware';
import mongoose, { Document } from 'mongoose';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

interface ILevel extends Document {
  _id: string;
  name: string;
  description: string;
  requiredXP: number;
  topics: string[];
  status: boolean;
}

const router = express.Router();

// Start a level
router.post('/start', authMiddleware, (async (req: AuthRequest, res: Response) => {
  try {
    const { levelId } = req.body;
    const userId = req.user.id;

    // Find the level
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({
        success: false,
        error: 'Level not found'
      });
    }

    // Find or create UserChapterLevel
    let userChapterLevel = await UserChapterLevel.findOne({
      userId,
      levelId,
      chapterId: level.chapterId
    });

    // Create new session
    const session = await UserLevelSession.create({
      userChapterLevelId: userChapterLevel?._id,
      userId,
      currentXp: 0,
      totalTime: level.totalTime,
      currentTime: level.totalTime,
      expiresAt: new Date(Date.now() + level.totalTime * 1000)
    });

    console.log('New session created');
    return res.status(201).json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    console.error('Error starting level:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}) as unknown as RequestHandler);

// Get levels by chapter ID
router.get('/:chapterId', authMiddleware, (async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;
    
    const levels = await Level.find({ chapterId })
      .select('name description requiredXP topics status')
      .sort({ createdAt: 1 }) as ILevel[];

    if (!levels.length) {
      return res.status(404).json({
        success: false,
        error: 'No levels found for this chapter'
      });
    }

    // Get user progress for these levels
    const userProgress = await UserChapterLevel.find({
        userId: new mongoose.Types.ObjectId(userId),
        chapterId: new mongoose.Types.ObjectId(chapterId),
        levelId: { $in: levels.map(level => new mongoose.Types.ObjectId(level._id)) }
      });

    // Create a map of level progress
    const progressMap = new Map(
      userProgress.map(progress => [progress.levelId.toString(), progress])
    );

    // Add user progress to each level
    const levelsWithProgress = levels.map(level => {
      const hasProgress = progressMap.has(level._id.toString());
      const isAvailable = level.status && hasProgress;
      
      return {
        ...level.toObject(),
        userProgress: progressMap.get(level._id.toString()) || null,
        isStarted: hasProgress,
        status: isAvailable
      };
    });

    return res.status(200).json({
      success: true,
      count: levels.length,
      data: levelsWithProgress
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}) as unknown as RequestHandler);

export default router; 