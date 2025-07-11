import mongoose, { Schema, Document } from 'mongoose';

// Session-specific aggregated metrics - permanent data
export interface IUserChapterTopicsPerformanceLogs extends Document {
  userChapterLevelId: mongoose.Types.ObjectId;
  userLevelSessionId: mongoose.Types.ObjectId;
  date: Date;
  topics: mongoose.Types.ObjectId[];
  totalSessions: number;
  questionsAnswered: {
    questionId: mongoose.Types.ObjectId;
    timeSpent: number;
    userAnswer: number;
    isCorrect: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const UserChapterTopicsPerformanceLogsSchema = new Schema<IUserChapterTopicsPerformanceLogs>({
  userChapterLevelId: {
    type: Schema.Types.ObjectId,
    ref: 'UserChapterLevel',
    required: true
  },
  userLevelSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'UserLevelSession',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalSessions: {
    type: Number,
    min: 0,
    required: true,
    default: 1
  },
  topics: {
    type: [mongoose.Types.ObjectId],
    ref: 'Topic',
    required: true,
    default: []
  },
  questionsAnswered: {
    type: [{
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      timeSpent: {
        type: Number,
        min: 0,
        required: true,
        default: 0
      },
      userAnswer: {
        type: Number,
        min: 0,
        max: 3,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }],
    required: true,
    default: []
  }
}, {
  timestamps: true
});

// Compound index for session-specific user performance
UserChapterTopicsPerformanceLogsSchema.index({ userChapterLevelId: 1, userLevelSessionId: 1, topics: 1, date: 1 }, { unique: true });

export const UserChapterTopicsPerformanceLogs = mongoose.model<IUserChapterTopicsPerformanceLogs>('UserChapterTopicsPerformanceLogs', UserChapterTopicsPerformanceLogsSchema); 