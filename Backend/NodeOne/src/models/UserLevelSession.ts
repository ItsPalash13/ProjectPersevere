import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLevelSession extends Document {
  userChapterLevelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  currentXp: number;
  totalTime: number;
  currentTime: number;
  expiresAt: Date;
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
  currentXp: {
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
  }
});

// Index for faster queries
UserLevelSessionSchema.index({ userChapterLevelId: 1 });
UserLevelSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 15 });

export const UserLevelSession = mongoose.model<IUserLevelSession>('UserLevelSession', UserLevelSessionSchema);
