import express, { Request, Response } from 'express';
import { Topic } from '../models/Topic';
import { UserTopicPerformance } from '../models/Performance/UserTopicPerformance';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);

export default router; 

// New APIs: User topic accuracy history (WMA) from UserTopicPerformance

// GET /api/performance/topics-accuracy-history?topicIds=a,b,c&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/topics-accuracy-history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const topicIdsParam = req.query.topicIds as string | undefined;
    const chapterId = req.query.chapterId as string | undefined;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    let topicIds: string[] = [];
    if (topicIdsParam && topicIdsParam.length > 0) {
      topicIds = topicIdsParam.split(',').map(id => id.trim()).filter(Boolean);
    } else if (chapterId) {
      const chapterTopics = await Topic.find({ chapterId }).select('_id');
      topicIds = chapterTopics.map((t: any) => t._id.toString());
    } else {
      return res.status(400).json({ error: 'Provide topicIds or chapterId' });
    }

    const utp = await UserTopicPerformance.findOne({ userId });
    if (!utp) {
      return res.json({ data: [], meta: { topicIds, startDate: startDate || null, endDate: endDate || null } });
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    // If end is a date-only string, include the full day by setting to 23:59:59.999
    if (end && end.toString() !== 'Invalid Date') {
      end.setHours(23, 59, 59, 999);
    }

    // Prepare topic name map
    const topicsDocs = await Topic.find({ _id: { $in: topicIds } }).select('_id topic').lean();
    const topicNameMap = new Map((topicsDocs as any[]).map((t: any) => [t._id.toString(), t.topic]));

    const topicIdSet = new Set(topicIds.map(id => id.toString()));
    const data = (utp.topics || [])
      .filter((t: any) => topicIdSet.has(t.topicId.toString()))
      .map((t: any) => {
        const history = Array.isArray(t.accuracyHistory) ? t.accuracyHistory : [];
        const filtered = history.filter((p: any) => {
          const ts = new Date(p.timestamp);
          if (start && ts < start) return false;
          if (end && ts > end) return false;
          return true;
        }).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
          topicId: t.topicId.toString(),
          topicName: topicNameMap.get(t.topicId.toString()) || null,
          accuracyHistory: filtered.map((p: any) => ({
            timestamp: p.timestamp,
            accuracy: p.accuracy
          }))
        };
      });

    return res.json({
      data,
      meta: {
        topicIds,
        chapterId: chapterId || null,
        startDate: startDate || null,
        endDate: endDate || null,
        totalTopics: data.length
      }
    });
  } catch (error) {
    console.error('Error fetching topics accuracy history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/performance/topics-accuracy-latest?topicIds=a,b,c
router.get('/topics-accuracy-latest', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const topicIdsParam = req.query.topicIds as string | undefined;
    const chapterId = req.query.chapterId as string | undefined;
    let topicIds: string[] = [];
    if (topicIdsParam && topicIdsParam.length > 0) {
      topicIds = topicIdsParam.split(',').map(id => id.trim()).filter(Boolean);
    } else if (chapterId) {
      const chapterTopics = await Topic.find({ chapterId }).select('_id');
      topicIds = chapterTopics.map((t: any) => t._id.toString());
    } else {
      return res.status(400).json({ error: 'Provide topicIds or chapterId' });
    }

    const utp = await UserTopicPerformance.findOne({ userId });
    if (!utp) {
      return res.json({ data: [], meta: { topicIds } });
    }

    const topicsDocs = await Topic.find({ _id: { $in: topicIds } }).select('_id topic').lean();
    const topicNameMap = new Map((topicsDocs as any[]).map((t: any) => [t._id.toString(), t.topic]));

    const topicIdSet = new Set(topicIds.map(id => id.toString()));
    const data = (utp.topics || [])
      .filter((t: any) => topicIdSet.has(t.topicId.toString()))
      .map((t: any) => {
        const history = Array.isArray(t.accuracyHistory) ? t.accuracyHistory : [];
        const latest = history.length > 0 ? history.reduce((a: any, b: any) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b) : null;
        return {
          topicId: t.topicId.toString(),
          topicName: topicNameMap.get(t.topicId.toString()) || null,
          latest: latest ? { timestamp: latest.timestamp, accuracy: latest.accuracy } : null
        };
      });
    
    return res.json({
      data,
      meta: {
        topicIds,
        chapterId: chapterId || null,
        totalTopics: data.length
      }
    });
  } catch (error) {
    console.error('Error fetching latest topics accuracy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});