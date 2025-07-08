import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserChapterLevelTopicsPerformanceLogs } from '../models/Performance/UserChapterLevelTopicsPerformanceLogs';
import { UserChapterLevel } from '../models/UserChapterLevel';
import { Chapter } from '../models/Chapter';
import { Level } from '../models/Level';
import { Topic } from '../models/Topic';
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
        });
        
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
        const performanceLogs = await UserChapterLevelTopicsPerformanceLogs.find({
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
        const result = Object.values(aggregatedData).map((topicSetData: any) => {
            const avgAccuracy = topicSetData.totalQuestionsAnswered > 0 
                ? (topicSetData.correctAnswers / topicSetData.totalQuestionsAnswered * 100).toFixed(2)
                : 0;
            const avgTimePerQuestion = topicSetData.totalQuestionsAnswered > 0 
                ? (topicSetData.totalTimeSpent / topicSetData.totalQuestionsAnswered).toFixed(2)
                : 0;
            
            return {
                topicSetId: topicSetData.topicIds.join(','),
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
        });
        
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

// API 2: Get questions answered data for specific chapter and level
router.get('/questions-answered/:chapterId/:levelId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { chapterId, levelId } = req.params;

        // Validate parameters
        if (!chapterId || !levelId) {
            return res.status(400).json({ error: 'Chapter ID and Level ID are required' });
        }

        // Check if chapter and level exist
        const [chapter, level] = await Promise.all([
            Chapter.findById(chapterId),
            Level.findById(levelId)
        ]);

        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        if (!level) {
            return res.status(404).json({ error: 'Level not found' });
        }

        // Get user's specific chapter level
        const userChapterLevel = await UserChapterLevel.findOne({
            userId,
            chapterId,
            levelId
        });

        if (!userChapterLevel) {
            return res.json({
                data: [],
                meta: {
                    chapterId,
                    chapterName: chapter.name,
                    levelId,
                    levelName: level.name,
                    levelNumber: level.levelNumber,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    accuracy: 0,
                    averageTimeSpent: 0
                }
            });
        }

        // Get performance logs for this specific level
        const performanceLogs = await UserChapterLevelTopicsPerformanceLogs.find({
            userChapterLevelId: userChapterLevel._id
        }).populate('questionId', 'ques options correctAnswer');

        // Get topics for this chapter
        const chapterTopics = await Topic.find({ chapterId });
        const topicMap = new Map(chapterTopics.map((topic: any) => [topic._id.toString(), topic.topic]));

        // Aggregate questions data
        const questionsData = performanceLogs.reduce((acc, log) => {
            log.questionsAnswered.forEach(question => {
                acc.push({
                    questionId: question.questionId,
                    timeSpent: question.timeSpent,
                    userAnswer: question.userAnswer,
                    isCorrect: question.isCorrect,
                    sessionDate: log.date,
                    topics: log.topics.map((topicId: any) => {
                        const topicName = topicMap.get(topicId.toString());
                        return {
                            topicId: topicId.toString(),
                            topicName: topicName || 'Unknown Topic'
                        };
                    })
                });
            });
            return acc;
        }, [] as any[]);

        // Calculate statistics
        const totalQuestions = questionsData.length;
        const correctAnswers = questionsData.filter(q => q.isCorrect).length;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(2) : 0;
        const averageTimeSpent = totalQuestions > 0 
            ? (questionsData.reduce((sum, q) => sum + q.timeSpent, 0) / totalQuestions).toFixed(2)
            : 0;

        // Group by date for time series analysis
        const questionsByDate = questionsData.reduce((acc, question) => {
            const dateKey = question.sessionDate.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    totalTimeSpent: 0
                };
            }
            acc[dateKey].questionsAnswered++;
            if (question.isCorrect) acc[dateKey].correctAnswers++;
            acc[dateKey].totalTimeSpent += question.timeSpent;
            return acc;
        }, {} as any);

        const dailyStats = Object.values(questionsByDate).map((dayData: any) => ({
            date: dayData.date,
            questionsAnswered: dayData.questionsAnswered,
            correctAnswers: dayData.correctAnswers,
            accuracy: dayData.questionsAnswered > 0 
                ? (dayData.correctAnswers / dayData.questionsAnswered * 100).toFixed(2)
                : 0,
            averageTimeSpent: dayData.questionsAnswered > 0 
                ? (dayData.totalTimeSpent / dayData.questionsAnswered).toFixed(2)
                : 0
        }));

        return res.json({
            data: {
                questions: questionsData,
                dailyStats: dailyStats
            },
            meta: {
                chapterId,
                chapterName: chapter.name,
                levelId,
                levelName: level.name,
                levelNumber: level.levelNumber,
                levelType: level.type,
                totalQuestions,
                correctAnswers,
                accuracy,
                averageTimeSpent,
                totalSessions: performanceLogs.length,
                dateRange: dailyStats.length > 0 ? {
                    startDate: dailyStats[0].date,
                    endDate: dailyStats[dailyStats.length - 1].date
                } : null
            }
        });

    } catch (error) {
        console.error('Error fetching questions answered data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Get day-wise accuracy for a given set of topics in a chapter for the current user
router.get('/chapter-topicset-daily-accuracy/:chapterId', async (req, res) => {
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
    const logs = await UserChapterLevelTopicsPerformanceLogs.find({
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

    // Group by date using filtered logs
    const statsByDate: { [date: string]: { questionsAnswered: number; correctAnswers: number } } = {};
    exactMatchLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!statsByDate[dateKey]) {
        statsByDate[dateKey] = { questionsAnswered: 0, correctAnswers: 0 };
      }
      log.questionsAnswered.forEach(q => {
        statsByDate[dateKey].questionsAnswered++;
        if (q.isCorrect) statsByDate[dateKey].correctAnswers++;
      });
    });
    const data = Object.entries(statsByDate).map(([date, stats]) => {
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

// Debug endpoint to create sample performance data
router.post('/create-sample-data/:chapterId', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { chapterId } = req.params;

        // Get all UserChapterLevel records for this user and chapter
        const userChapterLevels = await UserChapterLevel.find({
            userId,
            chapterId
        });

        if (userChapterLevels.length === 0) {
            return res.status(404).json({ error: 'No UserChapterLevel records found for this user and chapter' });
        }

        // Get topics for this chapter
        const chapterTopics = await Topic.find({ chapterId });
        const topicIds = chapterTopics.map(topic => topic._id);

        const createdLogs = [];

        // Create sample performance logs for each UserChapterLevel
        for (const userChapterLevel of userChapterLevels) {
            // Create multiple days of sample data
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i); // Go back i days

                // Create realistic sample data
                const questionsAnswered = [];
                const numQuestions = Math.floor(Math.random() * 10) + 5; // 5-15 questions
                
                for (let j = 0; j < numQuestions; j++) {
                    questionsAnswered.push({
                        questionId: new mongoose.Types.ObjectId(),
                        timeSpent: Math.floor(Math.random() * 60) + 15, // 15-75 seconds
                        userAnswer: Math.floor(Math.random() * 4), // 0-3
                        isCorrect: Math.random() > 0.3 // 70% accuracy
                    });
                }

                const sampleLog = new UserChapterLevelTopicsPerformanceLogs({
                    userChapterLevelId: userChapterLevel._id,
                    date: date,
                    topics: topicIds.slice(0, Math.floor(Math.random() * 3) + 1), // 1-3 topics
                    totalSessions: Math.floor(Math.random() * 3) + 1, // 1-3 sessions
                    questionsAnswered: questionsAnswered
                });

                await sampleLog.save();
                createdLogs.push(sampleLog._id);
            }
        }

        return res.json({
            message: 'Sample performance data created successfully',
            createdLogs: createdLogs.length,
            userChapterLevels: userChapterLevels.length,
            topicsUsed: topicIds.length
        });

    } catch (error) {
        console.error('Error creating sample data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


export default router; 