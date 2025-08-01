import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserChapterTopicsPerformanceLogs } from '../models/Performance/UserChapterTopicsPerformanceLogs';
import { UserChapterLevel, IUserChapterLevel } from '../models/UserChapterLevel';
import { Chapter } from '../models/Chapter';
import { Level } from '../models/Level';
import { Topic } from '../models/Topic';
import { Unit } from '../models/Units';
import { UserChapterUnit } from '../models/UserChapterUnit';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);

// API 1: Get user's chapter topics performance data with date filtering
router.get('/chapter-topics/:chapterId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { chapterId } = req.params;
        const { startDate, endDate } = req.query;

        // Validate chapterId
        if (!chapterId) {
            return res.status(400).json({ error: 'Chapter ID is required' });
        }

        // Check if chapter exists
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        // Build date filter
        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        // Get user's chapter levels
        const userChapterLevels = await UserChapterLevel.find({
            userId,
            chapterId
        }).lean() as IUserChapterLevel[];
        
        if (userChapterLevels.length === 0) {
            return res.json({
                data: [],
                meta: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                    totalRecords: 0,
                    chapterId,
                    chapterName: chapter.name
                }
            });
        }

        const userChapterLevelIds = userChapterLevels.map(level => level._id);

        // Get performance logs for all levels in this chapter
        const performanceLogs = await UserChapterTopicsPerformanceLogs.find({
            userChapterLevelId: { $in: userChapterLevelIds },
            ...dateFilter
        });

        // Get all topics for this chapter
        const chapterTopics = await Topic.find({ chapterId });
        const topicMap = new Map(chapterTopics.map((topic: any) => [topic._id.toString(), topic.topic]));

        // Group by topic sets and aggregate data
        const aggregatedData = performanceLogs.reduce((acc, log) => {
            // Create a unique key for the topic set (sorted topic IDs)
            const topicIds = log.topics.map((topicId: any) => topicId.toString()).sort();
            const topicSetKey = topicIds.join(',');
            
            if (!acc[topicSetKey]) {
                acc[topicSetKey] = {
                    topicIds: topicIds,
                    totalSessions: 0,
                    totalQuestionsAnswered: 0,
                    correctAnswers: 0,
                    totalTimeSpent: 0,
                    topics: new Map(), // Store topic ID and name
                    questionsAnswered: [],
                    datesPracticed: new Set()
                };
            }

            acc[topicSetKey].totalSessions += log.totalSessions;
            acc[topicSetKey].totalQuestionsAnswered += log.questionsAnswered.length;
            acc[topicSetKey].correctAnswers += log.questionsAnswered.filter(q => q.isCorrect).length;
            const totalTimeSpent = log.questionsAnswered.reduce((sum, q) => sum + q.timeSpent, 0);
            acc[topicSetKey].totalTimeSpent += totalTimeSpent;
            
            // Add topics with their IDs and names
            log.topics.forEach((topicId: any) => {
                const topicName = topicMap.get(topicId.toString());
                if (topicName) {
                    acc[topicSetKey].topics.set(topicId.toString(), topicName);
                }
            });
            
            acc[topicSetKey].questionsAnswered.push(...log.questionsAnswered);
            // Add date practiced
            acc[topicSetKey].datesPracticed.add(log.date.toISOString().split('T')[0]);

            return acc;
        }, {} as any);

        // Convert to array and calculate averages
        const result = Object.values(aggregatedData)
            .map((topicSetData: any) => {
                const avgAccuracy = topicSetData.totalQuestionsAnswered > 0 
                    ? (topicSetData.correctAnswers / topicSetData.totalQuestionsAnswered * 100).toFixed(2)
                    : 0;
                const avgTimePerQuestion = topicSetData.totalQuestionsAnswered > 0 
                    ? (topicSetData.totalTimeSpent / topicSetData.totalQuestionsAnswered).toFixed(2)
                    : 0;
                const topicSetId = topicSetData.topicIds.join(',');
                if (!topicSetId) return null;
                return {
                    topicSetId,
                    totalSessions: topicSetData.totalSessions,
                    totalQuestionsAnswered: topicSetData.totalQuestionsAnswered,
                    correctAnswers: topicSetData.correctAnswers,
                    accuracy: avgAccuracy,
                    averageTimePerQuestion: avgTimePerQuestion,
                    topics: Array.from(topicSetData.topics.entries()).map((entry: any) => ({
                        topicId: entry[0],
                        topicName: entry[1]
                    })),
                    totalDatesPracticed: topicSetData.datesPracticed.size
                };
            })
            .filter((x): x is NonNullable<typeof x> => x != null && x.topics && x.topics.length > 0);
        
        return res.json({
            data: result,
            meta: {
                startDate: startDate || null,
                endDate: endDate || null,
                totalRecords: result.length,
                chapterId,
                chapterName: chapter.name,
                totalTopicSets: result.length,
                totalSessions: result.reduce((sum, topicSet) => sum + topicSet.totalSessions, 0),
                totalQuestions: result.reduce((sum, topicSet) => sum + topicSet.totalQuestionsAnswered, 0),
                averageAccuracy: result.length > 0 
                    ? (result.reduce((sum, topicSet) => sum + Number(topicSet.accuracy), 0) / result.length).toFixed(2)
                    : '0',
                averageTimePerQuestion: result.length > 0 
                    ? (result.reduce((sum, topicSet) => sum + Number(topicSet.averageTimePerQuestion), 0) / result.length).toFixed(2)
                    : '0'
            }
        });

    } catch (error) {
        console.error('Error fetching chapter topics performance:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



// API: Get day-wise accuracy for a given set of topics in a chapter for the current user
router.get('/chapter-topicset-daily-accuracy/:chapterId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { chapterId } = req.params;
    const topicIdsParam = req.query.topicIds;
    if (!chapterId || !topicIdsParam) {
      return res.status(400).json({ error: 'Chapter ID and topicIds are required' });
    }
    const topicIds = (typeof topicIdsParam === 'string' ? topicIdsParam.split(',') : []).map(id => id.trim());
    if (!topicIds.length) {
      return res.status(400).json({ error: 'At least one topicId required' });
    }
    // Get topic names
    const topics = await Topic.find({ _id: { $in: topicIds } });
    if (!topics.length) {
      return res.status(404).json({ error: 'Topics not found' });
    }
    // Get user's chapter levels
    const userChapterLevels = await UserChapterLevel.find({ userId, chapterId });
    if (userChapterLevels.length === 0) {
      return res.json({ data: [], meta: { chapterId, topicIds, topicNames: topics.map(t => t.topic) } });
    }
    const userChapterLevelIds = userChapterLevels.map(l => l._id);
    // Get all logs for this user/chapter where all topicIds are present in log.topics
    const logs = await UserChapterTopicsPerformanceLogs.find({
      userChapterLevelId: { $in: userChapterLevelIds },
      topics: { $all: topicIds }
    });

    // Filter for exact topic set match (same topics, same count)
    const exactMatchLogs = logs.filter(log => {
      const logTopicIds = log.topics.map(id => id.toString()).sort();
      const requestedTopicIds = topicIds.sort();
      return logTopicIds.length === requestedTopicIds.length && 
             logTopicIds.every((id, index) => id === requestedTopicIds[index]);
    });

    // Group by date using filtered logs (since logs now have exact timestamps)
    const statsByDate: { [date: string]: { questionsAnswered: number; correctAnswers: number } } = {};
    exactMatchLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0]; // Extract date part from timestamp
      if (!statsByDate[dateKey]) {
        statsByDate[dateKey] = { questionsAnswered: 0, correctAnswers: 0 };
      }
      log.questionsAnswered.forEach(q => {
        statsByDate[dateKey].questionsAnswered++;
        if (q.isCorrect) statsByDate[dateKey].correctAnswers++;
      });
    });
    
    // Sort by date and return
    const data = Object.entries(statsByDate)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, stats]) => {
        const s = stats as { questionsAnswered: number; correctAnswers: number };
        return {
          date,
          questionsAnswered: s.questionsAnswered,
          correctAnswers: s.correctAnswers,
          accuracy: s.questionsAnswered > 0 ? ((s.correctAnswers / s.questionsAnswered) * 100).toFixed(2) : '0.00'
        };
      });
    return res.json({
      data,
      meta: { chapterId, topicIds, topicNames: topics.map(t => t.topic) }
    });
  } catch (error) {
    console.error('Error fetching topic set daily accuracy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get session-wise accuracy for a given set of topics in a chapter for the current user
router.get('/chapter-topicset-session-accuracy/:chapterId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { chapterId } = req.params;
    const topicIdsParam = req.query.topicIds;
    
    if (!chapterId || !topicIdsParam) {
      return res.status(400).json({ error: 'Chapter ID and topicIds are required' });
    }
    
    const topicIds = (typeof topicIdsParam === 'string' ? topicIdsParam.split(',') : []).map(id => id.trim());
    if (!topicIds.length) {
      return res.status(400).json({ error: 'At least one topicId required' });
    }
    
    // Get topic names
    const topics = await Topic.find({ _id: { $in: topicIds } });
    if (!topics.length) {
      return res.status(404).json({ error: 'Topics not found' });
    }
    
    // Get user's chapter levels
    const userChapterLevels = await UserChapterLevel.find({ userId, chapterId });
    if (userChapterLevels.length === 0) {
      return res.json({ data: [], meta: { chapterId, topicIds, topicNames: topics.map(t => t.topic) } });
    }
    
    const userChapterLevelIds = userChapterLevels.map(l => l._id);
    
    // Get all logs for this user/chapter where all topicIds are present in log.topics
    const logs = await UserChapterTopicsPerformanceLogs.find({
      userChapterLevelId: { $in: userChapterLevelIds },
      topics: { $all: topicIds },
      userLevelSessionId: { $exists: true, $ne: null }
    });

    // Filter for exact topic set match (same topics, same count)
    const exactMatchLogs = logs.filter(log => {
      const logTopicIds = log.topics.map(id => id.toString()).sort();
      const requestedTopicIds = topicIds.sort();
      return logTopicIds.length === requestedTopicIds.length && 
             logTopicIds.every((id, index) => id === requestedTopicIds[index]);
    });

    // Group by session + timestamp (since same session can have multiple records at different times)
    const statsBySessionTime: { [sessionTimeKey: string]: { 
      questionsAnswered: number; 
      correctAnswers: number; 
      sessionId: string;
      date: string;
      timestamp: string;
      sessionNumber: number;
    } } = {};
    
    exactMatchLogs.forEach(log => {
      // Skip logs without valid userLevelSessionId
      if (!log.userLevelSessionId) {
        return;
      }
      
      const sessionId = log.userLevelSessionId.toString();
      const timestamp = log.date.toISOString();
      const dateKey = log.date.toISOString().split('T')[0];
      const sessionTimeKey = `${sessionId}_${timestamp}`; // Unique key for session + timestamp
      
      if (!statsBySessionTime[sessionTimeKey]) {
        statsBySessionTime[sessionTimeKey] = { 
          questionsAnswered: 0, 
          correctAnswers: 0, 
          sessionId,
          date: dateKey,
          timestamp,
          sessionNumber: 0
        };
      }
      
      log.questionsAnswered.forEach(q => {
        statsBySessionTime[sessionTimeKey].questionsAnswered++;
        if (q.isCorrect) statsBySessionTime[sessionTimeKey].correctAnswers++;
      });
    });

    // Convert to array and sort by timestamp, then assign session numbers
    const data = Object.values(statsBySessionTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((stats, index) => ({
        sessionId: stats.sessionId,
        sessionNumber: index + 1,
        date: stats.date,
        timestamp: stats.timestamp,
        questionsAnswered: stats.questionsAnswered,
        correctAnswers: stats.correctAnswers,
        accuracy: stats.questionsAnswered > 0 ? 
          ((stats.correctAnswers / stats.questionsAnswered) * 100).toFixed(2) : '0.00'
      }));
    
    return res.json({
      data,
      meta: { chapterId, topicIds, topicNames: topics.map(t => t.topic), totalSessions: data.length }
    });
  } catch (error) {
    console.error('Error fetching topic set session accuracy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/unit-topics/:unitId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { unitId } = req.params;
        const { startDate, endDate } = req.query;

        // Validate unitId
        if (!unitId) {
            return res.status(400).json({ error: 'Unit ID is required' });
        }

        // Check if unit exists
        const unit = await Unit.findById(unitId);
        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        // Find UserChapterUnit for this user/unit
        const userChapterUnit = await UserChapterUnit.findOne({ userId, unitId });
        if (!userChapterUnit) {
            return res.json({
                data: [],
                meta: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                    totalRecords: 0,
                    unitId,
                    unitName: unit.name
                }
            });
        }
        const chapterId = userChapterUnit.chapterId;

        // Get all levels for this unit
        const levelsInUnit = await Level.find({ unitId }).select('_id');
        const levelIdsInUnit = levelsInUnit.map((l: any) => l._id.toString());

        // Get user's chapter levels for this chapter
        const userChapterLevels = await UserChapterLevel.find({
            userId,
            chapterId
        });
        // Only keep those whose levelId is in this unit
        const filteredUserChapterLevels = userChapterLevels.filter(({ levelId }) => levelIdsInUnit.includes(levelId.toString()));
        if (filteredUserChapterLevels.length === 0) {
            return res.json({
                data: [],
                meta: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                    totalRecords: 0,
                    unitId,
                    unitName: unit.name
                }
            });
        }
        const userChapterLevelIds = filteredUserChapterLevels.map(({ _id }) => _id as mongoose.Types.ObjectId);

        // Build date filter
        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        // Get performance logs for all levels in this unit
        const performanceLogs = await UserChapterTopicsPerformanceLogs.find({
            userChapterLevelId: { $in: userChapterLevelIds },
            ...dateFilter
        });

        // Get all topics for this unit
        const unitTopics = await Topic.find({ _id: { $in: unit.topics } });
        const topicMap = new Map(unitTopics.map((topic: any) => [topic._id.toString(), topic.topic]));

        // Group by topic sets and aggregate data
        const aggregatedData = performanceLogs.reduce((acc, log) => {
            // Create a unique key for the topic set (sorted topic IDs)
            const topicIds = log.topics.map((topicId: any) => topicId.toString()).sort();
            const topicSetKey = topicIds.join(',');
            
            if (!acc[topicSetKey]) {
                acc[topicSetKey] = {
                    topicIds: topicIds,
                    totalSessions: 0,
                    totalQuestionsAnswered: 0,
                    correctAnswers: 0,
                    totalTimeSpent: 0,
                    topics: new Map(), // Store topic ID and name
                    questionsAnswered: [],
                    datesPracticed: new Set()
                };
            }

            acc[topicSetKey].totalSessions += log.totalSessions;
            acc[topicSetKey].totalQuestionsAnswered += log.questionsAnswered.length;
            acc[topicSetKey].correctAnswers += log.questionsAnswered.filter(q => q.isCorrect).length;
            const totalTimeSpent = log.questionsAnswered.reduce((sum, q) => sum + q.timeSpent, 0);
            acc[topicSetKey].totalTimeSpent += totalTimeSpent;
            
            // Add topics with their IDs and names
            log.topics.forEach((topicId: any) => {
                const topicName = topicMap.get(topicId.toString());
                if (topicName) {
                    acc[topicSetKey].topics.set(topicId.toString(), topicName);
                }
            });
            
            acc[topicSetKey].questionsAnswered.push(...log.questionsAnswered);
            // Add date practiced
            acc[topicSetKey].datesPracticed.add(log.date.toISOString().split('T')[0]);

            return acc;
        }, {} as any);

        // Convert to array and calculate averages
        const result = Object.values(aggregatedData)
            .map((topicSetData: any) => {
                const avgAccuracy = topicSetData.totalQuestionsAnswered > 0 
                    ? (topicSetData.correctAnswers / topicSetData.totalQuestionsAnswered * 100).toFixed(2)
                    : 0;
                const avgTimePerQuestion = topicSetData.totalQuestionsAnswered > 0 
                    ? (topicSetData.totalTimeSpent / topicSetData.totalQuestionsAnswered).toFixed(2)
                    : 0;
                const topicSetId = topicSetData.topicIds.join(',');
                if (!topicSetId) return null;
                return {
                    topicSetId,
                    totalSessions: topicSetData.totalSessions,
                    totalQuestionsAnswered: topicSetData.totalQuestionsAnswered,
                    correctAnswers: topicSetData.correctAnswers,
                    accuracy: avgAccuracy,
                    averageTimePerQuestion: avgTimePerQuestion,
                    topics: Array.from(topicSetData.topics.entries()).map((entry: any) => ({
                        topicId: entry[0],
                        topicName: entry[1]
                    })),
                    totalDatesPracticed: topicSetData.datesPracticed.size
                };
            })
            .filter((x): x is NonNullable<typeof x> => x != null && x.topics && x.topics.length > 0);
        
        return res.json({
            data: result,
            meta: {
                startDate: startDate || null,
                endDate: endDate || null,
                totalRecords: result.length,
                unitId,
                unitName: unit.name,
                chapterId,
                totalTopicSets: result.length,
                totalSessions: result.reduce((sum, topicSet) => sum + topicSet.totalSessions, 0),
                totalQuestions: result.reduce((sum, topicSet) => sum + topicSet.totalQuestionsAnswered, 0),
                averageAccuracy: result.length > 0 
                    ? (result.reduce((sum, topicSet) => sum + Number(topicSet.accuracy), 0) / result.length).toFixed(2)
                    : '0',
                averageTimePerQuestion: result.length > 0 
                    ? (result.reduce((sum, topicSet) => sum + Number(topicSet.averageTimePerQuestion), 0) / result.length).toFixed(2)
                    : '0'
            }
        });

    } catch (error) {
        console.error('Error fetching unit topics performance:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


export default router; 