import mongoose, { Schema, Document } from 'mongoose';

export interface IUserChapterLevel extends Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  levelId: mongoose.Types.ObjectId;
  levelNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  maxXp: number;
  completedAt?: Date;
  startedAt: Date;
  lastAttemptedAt: Date;
  attempts: number;
}

export const UserChapterLevelSchema = new Schema<IUserChapterLevel>({
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
  maxXp: {
    type: Number,
    required: true,
    min: 0
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
  completedAt: {
    type: Date
  },
  startedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  lastAttemptedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
});

// Index for faster queries
UserChapterLevelSchema.index({ userId: 1, chapterId: 1, levelId: 1 }, { unique: true });

// Update lastAttemptedAt before saving
UserChapterLevelSchema.pre('save', function(next) {
  this.lastAttemptedAt = new Date();
  next();
});

export const UserChapterLevel = mongoose.model<IUserChapterLevel>('UserChapterLevel', UserChapterLevelSchema);