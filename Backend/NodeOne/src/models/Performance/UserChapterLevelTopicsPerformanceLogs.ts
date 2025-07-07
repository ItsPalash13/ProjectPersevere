import mongoose, { Schema, Document } from 'mongoose';

// Daily aggregated metrics - permanent data
export interface IUserChapterLevelTopicsPerformanceLogs extends Document {
  userChapterLevelId: mongoose.Types.ObjectId;
  date: Date; // Daily aggregation date
  topics: mongoose.Types.ObjectId[];
  totalSessions: number;
  questionsAnswered: {
    questionId: mongoose.Types.ObjectId;
    timeSpent: number;
    userAnswer: number;
    isCorrect: boolean;
  }[];
}

export const UserChapterLevelTopicsPerformanceLogsSchema = new Schema<IUserChapterLevelTopicsPerformanceLogs>({
  // Common fields
  userChapterLevelId: {
    type: Schema.Types.ObjectId,
    ref: 'UserChapterLevel',
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
  },


}, {
  timestamps: true
});


// Compound index for daily user performance
UserChapterLevelTopicsPerformanceLogsSchema.index({ userChapterLevelId: 1, topics: 1, date: 1 }, { unique: true });



export const UserChapterLevelTopicsPerformanceLogs = mongoose.model<IUserChapterLevelTopicsPerformanceLogs>('UserChapterLevelsTopicsPerformanceLogs', UserChapterLevelTopicsPerformanceLogsSchema); 