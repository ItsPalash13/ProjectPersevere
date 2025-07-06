import mongoose, { Schema, Document } from 'mongoose';

// Active session tracking - temporary data
export interface IUserLevelSessionTopicsLogs extends Document {
  userLevelSessionId: mongoose.Types.ObjectId;
  userChapterLevelId: mongoose.Types.ObjectId;
  topics: mongoose.Types.ObjectId[];
  status: number;
  questionsAnswered: {
    questionId: mongoose.Types.ObjectId;
    timeSpent: number;
    userAnswer: number;
    isCorrect: boolean;
  }[];
}

export const UserLevelSessionTopicsLogsSchema = new Schema<IUserLevelSessionTopicsLogs>({
  userLevelSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'UserLevelSession',
    required: true
  },
  userChapterLevelId: {
    type: Schema.Types.ObjectId,
    ref: 'UserChapterLevel',
    required: true
  },
  topics: {
    type: [mongoose.Types.ObjectId],
    ref: 'Topic',
    required: true,
    default: []
  },
  status: {
    type: Number,
    required: true,
    default: 0
  },
  questionsAnswered: {
    type: [{  // Array of objects
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question'
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

// Index for fast session lookups
UserLevelSessionTopicsLogsSchema.index({ userChapterLevelId: 1, userLevelSessionId: 1, topics: 1, createdAt: 1});

export const UserLevelSessionTopicsLogs = mongoose.model<IUserLevelSessionTopicsLogs>('UserLevelSessionTopicsLogs', UserLevelSessionTopicsLogsSchema); 