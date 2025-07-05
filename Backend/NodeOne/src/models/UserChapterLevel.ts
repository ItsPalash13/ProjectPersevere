import mongoose, { Schema, Document } from 'mongoose';

export interface IUserChapterLevel extends Document {
  // Common fields
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  levelId: mongoose.Types.ObjectId;
  levelNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  attemptType: 'time_rush' | 'precision_path';
  completedAt?: Date;
  lastAttemptedAt: Date;

  // Time Rush specific fields (only present when attemptType is 'time_rush')
  timeRush?: {
    attempts?: number;
    maxXp?: number | null;
    requiredXp?: number;
    timeLimit?: number;  // Time limit for Time Rush mode
  };

  // Precision Path specific fields (only present when attemptType is 'precision_path')
  precisionPath?: {
    attempts?: number;
    minTime?: number | null;
    requiredXp?: number;
  };
}

export const UserChapterLevelSchema = new Schema<IUserChapterLevel>({
  // Common fields
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
  levelNumber: {        
    type: Number,
    required: true,
    min: 1
  },        
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
    required: true
  },
  attemptType: {
    type: String,
    enum: ['time_rush', 'precision_path'],
    required: true
  },
  completedAt: {
    type: Date
  },
  lastAttemptedAt: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Time Rush specific fields (conditional based on attemptType)
  timeRush: {
    attempts: {
      type: Number,
      min: 0
    },
    maxXp: {
      type: Number,
      min: 0
    },
    requiredXp: {
      type: Number,
      min: 0
    },
    timeLimit: {
      type: Number,
      min: 0
    }
  },

  // Precision Path specific fields (conditional based on attemptType)
  precisionPath: {
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    minTime: {
      type: Number
    },
    requiredXp: {
      type: Number,
      min: 0
    }
  }
});

// Index for faster queries
UserChapterLevelSchema.index({ userId: 1, chapterId: 1, levelId: 1, attemptType: 1 }, { unique: true });

// Pre-save middleware to update appropriate high score
UserChapterLevelSchema.pre('save', function(next) {
  if (this.attemptType === 'time_rush' && this.timeRush) {
    // Time Rush: Increment attempts
    this.timeRush.attempts = (this.timeRush.attempts || 0) + 1;
  } else if (this.attemptType === 'precision_path' && this.precisionPath) {
    // Precision Path: Update min time if current time is faster
    if (this.completedAt && this.lastAttemptedAt) {
      const timeTaken = (this.completedAt.getTime() - this.lastAttemptedAt.getTime()) / 1000;
      const currentMinTime = this.precisionPath.minTime;
      if (currentMinTime === null || currentMinTime === undefined || timeTaken < currentMinTime) {
        this.precisionPath.minTime = timeTaken;
      }
      // Increment attempts
      this.precisionPath.attempts = (this.precisionPath.attempts || 0) + 1;
    }
  }
  next();
});

export const UserChapterLevel = mongoose.model<IUserChapterLevel>('UserChapterLevel', UserChapterLevelSchema);

// Example Time Rush UserChapterLevel document
const timeRushUCL = {
  _id: "683317d460cc5230f6f12c90",
  userId: "68282f7ddbdd9eb022d7cce5",
  chapterId: "684178b759aa59113383b7bc",
  levelId: "684178b759aa59113383b7c1",
  levelNumber: 1,
  status: "not_started",
  attemptType: "time_rush",
  lastAttemptedAt: new Date(),
  timeRush: {
    attempts: 0,
    maxXp: 0,
    requiredXp: 100,  // Example required XP
    timeLimit: 300    // Example time limit in seconds (5 minutes)
  },
  precisionPath: {
    attempts: 0,
    minTime: Infinity,
    requiredXp: 100   // Same required XP as Time Rush
  }
};