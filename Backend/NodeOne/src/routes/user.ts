import express from 'express';
import { UserProfile } from '../models/UserProfile';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// GET user info
router.get('/info/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUser = (req as any).user;
    if (!authUser || authUser.id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const user = await UserProfile.findOne({ userId }).populate({
      path: 'badges.badgeId',
      select: 'badgeName badgeType badgeslug badgeDescription badgelevel',
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH user info
router.patch('/info/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUser = (req as any).user;
    if (!authUser || authUser.id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const allowedFields = ['username', 'fullName', 'bio', 'dob', 'avatar', 'avatarBgColor'];
    const update: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }
    const user = await UserProfile.findOneAndUpdate({ userId }, update, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET user settings (dummy)
router.get('/settings/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUser = (req as any).user;
    if (!authUser || authUser.id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    // Dummy settings
    res.json({ success: true, data: { darkMode: false, notifications: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH user settings (dummy)
router.patch('/settings/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUser = (req as any).user;
    if (!authUser || authUser.id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    // Accept and echo back settings for now
    res.json({ success: true, data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET monthly leaderboard
router.get('/monthly-leaderboard', async (req, res) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7).replace('-', '/');
    
    // Get top 10 users for the specified month
    const leaderboard = await UserProfile.aggregate([
      {
        $match: {
          [`monthlyXp.${currentMonth}`]: { $exists: true, $gt: 0 }
        }
      },
      {
        $project: {
          userId: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          avatarBgColor: 1,
          monthlyXp: 1,
          totalCoins: 1
        }
      },
      {
        $addFields: {
          currentMonthXp: { $ifNull: [`$monthlyXp.${currentMonth}`, 0] }
        }
      },
      {
        $sort: { currentMonthXp: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          avatarBgColor: 1,
          currentMonthXp: 1,
          totalCoins: 1,
          displayName: {
            $cond: {
              if: { $and: [{ $ne: ['$fullName', null] }, { $ne: ['$fullName', ''] }] },
              then: '$fullName',
              else: '$username'
            }
          }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: leaderboard,
      month: currentMonth
    });
  } catch (error) {
    console.error('Error fetching monthly leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
