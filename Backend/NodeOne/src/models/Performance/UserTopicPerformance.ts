import mongoose, { Schema, Document } from 'mongoose';

interface IAccuracyPoint {
  timestamp: Date;
  accuracy: number; // 0.0 - 1.0
}

interface ITopicPerformanceEntry {
  topicId: mongoose.Types.ObjectId;
  attemptsWindow: IAttemptsPoint[];
  accuracyHistory: IAccuracyPoint[];
}

export interface IUserTopicPerformance extends Document {
  userId: mongoose.Types.ObjectId;
  topics: ITopicPerformanceEntry[];
  createdAt: Date;
  updatedAt: Date;
}

interface IAttemptsPoint {
  timestamp: Date;
  value: number; // numeric value for the window (e.g., attempts count)
}

const AttemptsPointSchema = new Schema<IAttemptsPoint>({
  timestamp: { type: Date, required: true, default: () => new Date() },
  value: { type: Number, required: true, min: 0 }
}, { _id: false });

const AccuracyPointSchema = new Schema<IAccuracyPoint>({
  timestamp: { type: Date, required: true, default: () => new Date() },
  accuracy: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const TopicPerformanceEntrySchema = new Schema<ITopicPerformanceEntry>({
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  attemptsWindow: {
    type: [AttemptsPointSchema],
    required: true,
    default: []
  },
  accuracyHistory: {
    type: [AccuracyPointSchema],
    required: true,
    default: []
  }
}, { _id: false });

export const UserTopicPerformanceSchema = new Schema<IUserTopicPerformance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topics: {
    type: [TopicPerformanceEntrySchema],
    required: true,
    default: []
  }
}, { timestamps: true });

// Helpful index for querying a user's performance on a specific topic
UserTopicPerformanceSchema.index({ userId: 1, 'topics.topicId': 1 });

export const UserTopicPerformance = mongoose.model<IUserTopicPerformance>('UserTopicPerformance', UserTopicPerformanceSchema);


