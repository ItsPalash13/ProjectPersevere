import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLevelSession extends Document {
  userChapterLevelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  levelId: mongoose.Types.ObjectId;
  status: 0 | 1;
  requiredXp: number;
  currentXp: number;
  maxXp: number | undefined;
  totalTime: number;
  currentTime: number;
  expiresAt: Date;
  reconnectCount: number;
  reconnectExpiresAt: Date | null;
  currentQuestion: mongoose.Types.ObjectId | null;
  powerups: {
    powerupEventHistory: {
      events: {
        scoreChange: number;
        timestamp: number;
        isCorrect: boolean;
      }[];
    };
  };
}

export const UserLevelSessionSchema = new Schema<IUserLevelSession>({
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
  status: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  requiredXp: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },  
  currentXp: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  maxXp: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  totalTime: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  currentTime: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  reconnectCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  reconnectExpiresAt: {
    type: Date,
    default: null,
    index: { expires: 0 }
  },
  currentQuestion: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: false,
    default: null
  },
  powerups: {
    powerupEventHistory: {
      events: [{
        scoreChange: {
          type: Number,
          required: true
        },
        timestamp: {
          type: Number,
          required: true
        },
        isCorrect: {
          type: Boolean,
          required: true
        }
      }]
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
UserLevelSessionSchema.index({ userChapterLevelId: 1 });

// Add TTL index for expiresAt
UserLevelSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UserLevelSessionSchema.index({ reconnectExpiresAt: 1 }, { expireAfterSeconds: 0 });

export const UserLevelSession = mongoose.model<IUserLevelSession>('UserLevelSession', UserLevelSessionSchema);
