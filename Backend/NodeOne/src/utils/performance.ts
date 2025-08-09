// import mongoose from 'mongoose';
import { UserTopicPerformance } from '../models/Performance/UserTopicPerformance';
import { Topic } from '../models/Topic';

type TopicAccuracyUpdate = {
  topicId: string;
  topicName: string | null;
  previousAccuracy: number | null;
  updatedAccuracy: number;
};

type ProcessResult = {
  topicsTouched: number;
  topics: TopicAccuracyUpdate[];
};

function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function computeWeightedMovingAverage(points: Array<{ timestamp: Date | string; value: number }>, weight: number): number {
  if (!Array.isArray(points) || points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    const w = Math.pow(weight, index);
    numerator += sorted[index].value * w;
    denominator += w;
  }
  return denominator > 0 ? numerator / denominator : 0;
}

export async function processUserLevelSession(
  session: any,
  options?: { attemptWindowSize?: number; accuracyWeight?: number }
): Promise<ProcessResult> {
  const attemptWindowSize = options?.attemptWindowSize ?? getEnvNumber('ATTEMPT_WINDOW_SIZE', 10);
  const accuracyWeight = options?.accuracyWeight ?? getEnvNumber('ACCURACY_WEIGHT', 1.2);
  

  try {
    const snapshot = session as any;
    if (!snapshot) {
      throw new Error('Session payload missing');
    }

    const now = new Date();

    // Upsert or fetch the user topic performance document
    let utp = await UserTopicPerformance.findOne({ userId: snapshot.userId });
    if (!utp) {
      utp = new UserTopicPerformance({ userId: snapshot.userId, topics: [] });
    }

    const topicsChangedIndexSet = new Set<number>();
    let skippedQuestions = 0;

    const ensureTopicIndex = (topicId: any): number => {
      const topics = utp!.topics as any[];
      for (let i = 0; i < topics.length; i += 1) {
        if (topics[i].topicId && String(topics[i].topicId) === String(topicId)) {
          return i;
        }
      }
      topics.push({ topicId, attemptsWindow: [], accuracyHistory: [] });
      return topics.length - 1;
    };

    for (const entry of snapshot.questionsHistory || []) {
      if (entry.correctOption === undefined || entry.correctOption === null) {
        skippedQuestions += 1;
        continue;
      }

      const isCorrect = entry.userOptionChoice === entry.correctOption ? 1 : 0;

      for (const topic of entry.topics || []) {
        const topicId = (topic as any).topicId;
        if (!topicId) continue;

        const idx = ensureTopicIndex(topicId);
        const topicEntry = (utp.topics as any[])[idx];

        topicEntry.attemptsWindow.push({ timestamp: now, value: isCorrect });
        if (Array.isArray(topicEntry.attemptsWindow) && topicEntry.attemptsWindow.length > attemptWindowSize) {
          topicEntry.attemptsWindow = topicEntry.attemptsWindow.slice(-attemptWindowSize);
        }
        topicsChangedIndexSet.add(idx);
      }
    }

    // Compute and append WMA accuracy once per touched topic
    const perTopicUpdates: TopicAccuracyUpdate[] = [];
    for (const idx of topicsChangedIndexSet) {
      const topicEntry = (utp.topics as any[])[idx];
      const topicIdStr = String(topicEntry.topicId);
      const history = Array.isArray(topicEntry.accuracyHistory) ? topicEntry.accuracyHistory : [];
      const previousAccuracy = history.length > 0 ? history[history.length - 1].accuracy : null;
      const wma = computeWeightedMovingAverage(topicEntry.attemptsWindow || [], accuracyWeight);
      topicEntry.accuracyHistory.push({ timestamp: now, accuracy: wma });
      perTopicUpdates.push({ topicId: topicIdStr, topicName: null, previousAccuracy, updatedAccuracy: wma });
    }

    if (topicsChangedIndexSet.size > 0) {
      await utp.save();
    }

    // Enrich with topic names using a reusable helper
    if (perTopicUpdates.length > 0) {
      const ids = Array.from(new Set(perTopicUpdates.map(t => t.topicId)));
      const nameMap = await mapTopicIdsToNames(ids);
      perTopicUpdates.forEach(t => { t.topicName = nameMap.get(t.topicId) || null; });
    }

    // No status updates; processing live session object

    return {
      topicsTouched: topicsChangedIndexSet.size,
      topics: Array.from(perTopicUpdates),
    };
  } catch (error: any) {
    throw error;
  }
}

export default {
  processUserLevelSession,
};

// General helper to map topic IDs to names
export async function mapTopicIdsToNames(topicIds: string[]): Promise<Map<string, string>> {
  if (!Array.isArray(topicIds) || topicIds.length === 0) return new Map();
  const uniqueIds = Array.from(new Set(topicIds)).map(id => id.toString());
  const topicsDocs = await Topic.find({ _id: { $in: uniqueIds } }).select('_id topic').lean();
  return new Map((topicsDocs as any[]).map((t: any) => [t._id.toString(), t.topic as string]));
}


