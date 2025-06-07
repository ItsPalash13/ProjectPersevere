import mongoose, { Schema, Document } from 'mongoose';

export interface IUserChapterLevelPerformanceLogs extends Document {
  // Common fields
  userChapterLevelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  levelId: mongoose.Types.ObjectId;
  attemptType: 'time_rush' | 'precision_path';
  currentQuestion: mongoose.Types.ObjectId | null;
  questionsAnswered: {
    correct: mongoose.Types.ObjectId[];
    incorrect: mongoose.Types.ObjectId[];
  };

  // Time Rush specific fields
  timeRush: {
    requiredXp: number;
    currentXp: number;
    maxXp: number;
    timeLimit: number;
    currentTime: number;
  };

  // Precision Path specific fields
  precisionPath: {
    requiredXp: number;
    currentXp: number;
    currentTime: number;
    minTime: number;
  };
}

export const UserChapterLevelPerformanceLogsSchema = new Schema<IUserChapterLevelPerformanceLogs>({
  // Common fields
  userChapterLevelId: {
    type: Schema.Types.ObjectId,
    ref: 'UserChapterLevel',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  levelId: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  attemptType: {
    type: String,
    enum: ['time_rush', 'precision_path'],
    required: true
  },
  currentQuestion: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: false,
    default: null
  },
  questionsAnswered: {
    correct: [{
      type: Schema.Types.ObjectId,
      ref: 'Question'
    }],
    incorrect: [{
      type: Schema.Types.ObjectId,
      ref: 'Question'
    }]
  },

  // Time Rush specific fields
  timeRush: {
    requiredXp: {
      type: Number,
      min: 0,
    },
    currentXp: {
      type: Number,
      min: 0,
    },
    maxXp: {
      type: Number,
      min: 0
    },
    timeLimit: {
      type: Number,
      min: 0,
    },
    currentTime: {
      type: Number,
      min: 0,
    }
  },

  // Precision Path specific fields
  precisionPath: {
    requiredXp: {
      type: Number,
      min: 0,
    },
    currentXp: {
      type: Number,
      min: 0,
    },
    currentTime: {
      type: Number,
      min: 0,
    },
    minTime: {
      type: Number,
      min: 0,
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
UserChapterLevelPerformanceLogsSchema.index({ userChapterLevelId: 1,userId: 1, chapterId: 1, levelId: 1, attemptType: 1 , timestamp: 1});

// Pre-save middleware to validate session type constraints
UserChapterLevelPerformanceLogsSchema.pre('save', function(next) {
  if (this.attemptType === 'time_rush') {
    // Time Rush: must have timeLimit > 0, can exceed requiredXp
    if (this.timeRush.timeLimit <= 0) {
      return next(new Error('Time Rush mode must have a positive time limit'));
    }
  } else {
    // Precision Path: currentXp cannot exceed requiredXp
    if (this.precisionPath.currentXp > this.precisionPath.requiredXp) {
      this.precisionPath.currentXp = this.precisionPath.requiredXp;
    }
  }
  next();
});

export const UserChapterLevelPerformanceLogs = mongoose.model<IUserChapterLevelPerformanceLogs>('UserChapterLevelPerformanceLogs', UserChapterLevelPerformanceLogsSchema);
