import express from 'express';
import { UserProfile } from '../../models/UserProfile';
import { UserChapterUnit } from '../../models/UserChapterUnit';
import { UserChapterLevel } from '../../models/UserChapterLevel';
import { UserLevelSession } from '../../models/UserLevelSession';
import { Chapter } from '../../models/Chapter';
import { Unit } from '../../models/Units';
import { Level } from '../../models/Level';

const router = express.Router();

// ==================== USER PROFILES ====================

// GET all user profiles
router.get('/profiles', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [profiles, total] = await Promise.all([
      UserProfile.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      UserProfile.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profiles',
      error: error.message
    });
  }
});

// GET user profile by ID
router.get('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await UserProfile.findById(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// POST create user profile
router.post('/profiles', async (req, res) => {
  try {
    const { userId, username, email, fullName, bio, dob, health, totalXp } = req.body;

    // Validate required fields
    if (!userId || !username || !email) {
      return res.status(400).json({
        success: false,
        message: 'userId, username, and email are required'
      });
    }

    // Check if user already exists
    const existingUser = await UserProfile.findOne({
      $or: [{ userId }, { username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this userId, username, or email already exists'
      });
    }

    const profile = new UserProfile({
      userId,
      username,
      email,
      fullName,
      bio,
      dob: dob ? new Date(dob) : undefined,
      health: health || 6,
      totalXp: totalXp || 0
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'User profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user profile',
      error: error.message
    });
  }
});

// PUT update user profile
router.put('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, fullName, bio, dob, health, totalXp } = req.body;

    const profile = await UserProfile.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Check for conflicts if username or email is being changed
    if (username && username !== profile.username) {
      const existingUser = await UserProfile.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    if (email && email !== profile.email) {
      const existingUser = await UserProfile.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    const updatedProfile = await UserProfile.findByIdAndUpdate(
      id,
      {
        username,
        email,
        fullName,
        bio,
        dob: dob ? new Date(dob) : undefined,
        health,
        totalXp
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
});

// DELETE user profile
router.delete('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await UserProfile.findById(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    await UserProfile.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user profile',
      error: error.message
    });
  }
});

// ==================== USER CHAPTER UNITS ====================

// GET all user chapter units
router.get('/chapter-units', async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, chapterId, unitId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let filter: any = {};
    if (userId) filter.userId = userId;
    if (chapterId) filter.chapterId = chapterId;
    if (unitId) filter.unitId = unitId;
    if (status) filter.status = status;

    const [userChapterUnits, total] = await Promise.all([
      UserChapterUnit.find(filter)
        .populate('chapterId', 'name')
        .populate('unitId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      UserChapterUnit.countDocuments(filter)
    ]);

    // Populate user profile data for each user chapter unit
    const userChapterUnitsWithProfiles = await Promise.all(
      userChapterUnits.map(async (unit) => {
        const userProfile = await UserProfile.findOne({ userId: unit.userId });
        return {
          ...unit.toObject(),
          userProfile: userProfile ? {
            _id: userProfile._id,
            username: userProfile.username,
            email: userProfile.email,
            fullName: userProfile.fullName
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: userChapterUnitsWithProfiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user chapter units:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user chapter units',
      error: error.message
    });
  }
});

// GET user chapter unit by ID
router.get('/chapter-units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userChapterUnit = await UserChapterUnit.findById(id)
      .populate('chapterId', 'name')
      .populate('unitId', 'name');

    if (!userChapterUnit) {
      return res.status(404).json({
        success: false,
        message: 'User chapter unit not found'
      });
    }

    // Get user profile data
    const userProfile = await UserProfile.findOne({ userId: userChapterUnit.userId });
    const userChapterUnitWithProfile = {
      ...userChapterUnit.toObject(),
      userProfile: userProfile ? {
        _id: userProfile._id,
        username: userProfile.username,
        email: userProfile.email,
        fullName: userProfile.fullName
      } : null
    };

    if (!userChapterUnit) {
      return res.status(404).json({
        success: false,
        message: 'User chapter unit not found'
      });
    }

    res.json({
      success: true,
      data: userChapterUnitWithProfile
    });
  } catch (error) {
    console.error('Error fetching user chapter unit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user chapter unit',
      error: error.message
    });
  }
});

// POST create user chapter unit
router.post('/chapter-units', async (req, res) => {
  try {
    const { userId, chapterId, unitId, status = 'not_started' } = req.body;

    // Validate required fields
    if (!userId || !chapterId || !unitId) {
      return res.status(400).json({
        success: false,
        message: 'userId, chapterId, and unitId are required'
      });
    }

    // Validate status
    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be not_started, in_progress, or completed'
      });
    }

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(400).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Check if unit exists
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(400).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Check if user chapter unit already exists
    const existingUserChapterUnit = await UserChapterUnit.findOne({
      userId,
      chapterId,
      unitId
    });

    if (existingUserChapterUnit) {
      return res.status(400).json({
        success: false,
        message: 'User chapter unit already exists'
      });
    }

    const userChapterUnit = new UserChapterUnit({
      userId,
      chapterId,
      unitId,
      status
    });

    await userChapterUnit.save();

    const populatedUserChapterUnit = await UserChapterUnit.findById(userChapterUnit._id)
      .populate('chapterId', 'name')
      .populate('unitId', 'name');

    if (!populatedUserChapterUnit) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve created user chapter unit'
      });
    }

    // Get user profile data
    const userProfile = await UserProfile.findOne({ userId: populatedUserChapterUnit.userId });
    const populatedUserChapterUnitWithProfile = {
      ...populatedUserChapterUnit.toObject(),
      userProfile: userProfile ? {
        _id: userProfile._id,
        username: userProfile.username,
        email: userProfile.email,
        fullName: userProfile.fullName
      } : null
    };

    res.status(201).json({
      success: true,
      message: 'User chapter unit created successfully',
      data: populatedUserChapterUnitWithProfile
    });
  } catch (error) {
    console.error('Error creating user chapter unit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user chapter unit',
      error: error.message
    });
  }
});

// PUT update user chapter unit
router.put('/chapter-units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userChapterUnit = await UserChapterUnit.findById(id);
    if (!userChapterUnit) {
      return res.status(404).json({
        success: false,
        message: 'User chapter unit not found'
      });
    }

    // Validate status
    if (status && !['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be not_started, in_progress, or completed'
      });
    }

    const updatedUserChapterUnit = await UserChapterUnit.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('chapterId', 'name')
     .populate('unitId', 'name');

    if (!updatedUserChapterUnit) {
      return res.status(404).json({
        success: false,
        message: 'User chapter unit not found'
      });
    }

    // Get user profile data
    const userProfile = await UserProfile.findOne({ userId: updatedUserChapterUnit.userId });
    const updatedUserChapterUnitWithProfile = {
      ...updatedUserChapterUnit.toObject(),
      userProfile: userProfile ? {
        _id: userProfile._id,
        username: userProfile.username,
        email: userProfile.email,
        fullName: userProfile.fullName
      } : null
    };

    res.json({
      success: true,
      message: 'User chapter unit updated successfully',
      data: updatedUserChapterUnitWithProfile
    });
  } catch (error) {
    console.error('Error updating user chapter unit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user chapter unit',
      error: error.message
    });
  }
});

// DELETE user chapter unit
router.delete('/chapter-units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userChapterUnit = await UserChapterUnit.findById(id);
    
    if (!userChapterUnit) {
      return res.status(404).json({
        success: false,
        message: 'User chapter unit not found'
      });
    }

    await UserChapterUnit.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User chapter unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user chapter unit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user chapter unit',
      error: error.message
    });
  }
});

// ==================== USER CHAPTER LEVELS ====================

// GET all user chapter levels
router.get('/chapter-levels', async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, chapterId, levelId, attemptType, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let filter: any = {};
    if (userId) filter.userId = userId;
    if (chapterId) filter.chapterId = chapterId;
    if (levelId) filter.levelId = levelId;
    if (attemptType) filter.attemptType = attemptType;
    if (status) filter.status = status;

    const [userChapterLevels, total] = await Promise.all([
      UserChapterLevel.find(filter)
        .populate('chapterId', 'name')
        .populate('levelId', 'name levelNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      UserChapterLevel.countDocuments(filter)
    ]);

    // Populate user profile data for each user chapter level
    const userChapterLevelsWithProfiles = await Promise.all(
      userChapterLevels.map(async (level) => {
        const userProfile = await UserProfile.findOne({ userId: level.userId });
        return {
          ...level.toObject(),
          userProfile: userProfile ? {
            _id: userProfile._id,
            username: userProfile.username,
            email: userProfile.email,
            fullName: userProfile.fullName
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: userChapterLevelsWithProfiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user chapter levels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user chapter levels',
      error: error.message
    });
  }
});

// GET user chapter level by ID
router.get('/chapter-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userChapterLevel = await UserChapterLevel.findById(id)
      .populate('chapterId', 'name')
      .populate('levelId', 'name levelNumber');

    if (!userChapterLevel) {
      return res.status(404).json({
        success: false,
        message: 'User chapter level not found'
      });
    }

    res.json({
      success: true,
      data: userChapterLevel
    });
  } catch (error) {
    console.error('Error fetching user chapter level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user chapter level',
      error: error.message
    });
  }
});

// POST create user chapter level
router.post('/chapter-levels', async (req, res) => {
  try {
    const {
      userId,
      chapterId,
      levelId,
      levelNumber,
      status = 'not_started',
      attemptType,
      timeRush,
      precisionPath
    } = req.body;

    // Validate required fields
    if (!userId || !chapterId || !levelId || !levelNumber || !attemptType) {
      return res.status(400).json({
        success: false,
        message: 'userId, chapterId, levelId, levelNumber, and attemptType are required'
      });
    }

    // Validate status
    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be not_started, in_progress, or completed'
      });
    }

    // Validate attemptType
    if (!['time_rush', 'precision_path'].includes(attemptType)) {
      return res.status(400).json({
        success: false,
        message: 'AttemptType must be time_rush or precision_path'
      });
    }

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(400).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Check if level exists
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(400).json({
        success: false,
        message: 'Level not found'
      });
    }

    // Check if user chapter level already exists
    const existingUserChapterLevel = await UserChapterLevel.findOne({
      userId,
      chapterId,
      levelId,
      attemptType
    });

    if (existingUserChapterLevel) {
      return res.status(400).json({
        success: false,
        message: 'User chapter level already exists for this attempt type'
      });
    }

    const userChapterLevelData: any = {
      userId,
      chapterId,
      levelId,
      levelNumber,
      status,
      attemptType,
      lastAttemptedAt: new Date()
    };

    // Add type-specific fields
    if (attemptType === 'time_rush' && timeRush) {
      userChapterLevelData.timeRush = timeRush;
    } else if (attemptType === 'precision_path' && precisionPath) {
      userChapterLevelData.precisionPath = precisionPath;
    }

    const userChapterLevel = new UserChapterLevel(userChapterLevelData);
    await userChapterLevel.save();

    const populatedUserChapterLevel = await UserChapterLevel.findById(userChapterLevel._id)
      .populate('chapterId', 'name')
      .populate('levelId', 'name levelNumber');

    res.status(201).json({
      success: true,
      message: 'User chapter level created successfully',
      data: populatedUserChapterLevel
    });
  } catch (error) {
    console.error('Error creating user chapter level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user chapter level',
      error: error.message
    });
  }
});

// PUT update user chapter level
router.put('/chapter-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      timeRush,
      precisionPath,
      completedAt
    } = req.body;

    const userChapterLevel = await UserChapterLevel.findById(id);
    if (!userChapterLevel) {
      return res.status(404).json({
        success: false,
        message: 'User chapter level not found'
      });
    }

    // Validate status
    if (status && !['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be not_started, in_progress, or completed'
      });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : undefined;

    // Update type-specific fields
    if (userChapterLevel.attemptType === 'time_rush' && timeRush) {
      updateData.timeRush = timeRush;
    } else if (userChapterLevel.attemptType === 'precision_path' && precisionPath) {
      updateData.precisionPath = precisionPath;
    }

    const updatedUserChapterLevel = await UserChapterLevel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('chapterId', 'name')
     .populate('levelId', 'name levelNumber');

    res.json({
      success: true,
      message: 'User chapter level updated successfully',
      data: updatedUserChapterLevel
    });
  } catch (error) {
    console.error('Error updating user chapter level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user chapter level',
      error: error.message
    });
  }
});

// DELETE user chapter level
router.delete('/chapter-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userChapterLevel = await UserChapterLevel.findById(id);
    
    if (!userChapterLevel) {
      return res.status(404).json({
        success: false,
        message: 'User chapter level not found'
      });
    }

    await UserChapterLevel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User chapter level deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user chapter level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user chapter level',
      error: error.message
    });
  }
});

// ==================== USER LEVEL SESSIONS (READ ONLY) ====================

// GET all user level sessions
router.get('/level-sessions', async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, chapterId, levelId, attemptType, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let filter: any = {};
    if (userId) filter.userId = userId;
    if (chapterId) filter.chapterId = chapterId;
    if (levelId) filter.levelId = levelId;
    if (attemptType) filter.attemptType = attemptType;
    if (status !== undefined) filter.status = Number(status);

    const [userLevelSessions, total] = await Promise.all([
      UserLevelSession.find(filter)
        .populate('chapterId', 'name')
        .populate('levelId', 'name levelNumber')
        .populate('currentQuestion', 'question')
        .populate('questionsAnswered.correct', 'question')
        .populate('questionsAnswered.incorrect', 'question')
        .populate('questionBank', 'question')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      UserLevelSession.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: userLevelSessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user level sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user level sessions',
      error: error.message
    });
  }
});

// GET user level session by ID
router.get('/level-sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userLevelSession = await UserLevelSession.findById(id)
      .populate('chapterId', 'name')
      .populate('levelId', 'name levelNumber')
      .populate('currentQuestion', 'question')
      .populate('questionsAnswered.correct', 'question')
      .populate('questionsAnswered.incorrect', 'question')
      .populate('questionBank', 'question');

    if (!userLevelSession) {
      return res.status(404).json({
        success: false,
        message: 'User level session not found'
      });
    }

    res.json({
      success: true,
      data: userLevelSession
    });
  } catch (error) {
    console.error('Error fetching user level session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user level session',
      error: error.message
    });
  }
});

export default router;
