import mongoose, { Schema, Document } from 'mongoose';

export interface ILevel extends Document {
  name: string;
  levelNumber: number;
  description: string;
  requiredXp: number;
  topics: string[];
  status: boolean;
  totalTime: number;
  chapterId: mongoose.Types.ObjectId;
  difficultyParams: {
    mean: number;
    sd: number;
    alpha: number;
  };
}

export const LevelSchema = new Schema<ILevel>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  levelNumber: {
    type: Number,
    required: true,
    min: 1
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  requiredXp: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: false
  },
  totalTime: {
    type: Number,
    default: 0,
    min: 0
  },
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  topics: [{ 
    type: String,
    required: true,
    trim: true
  }],
  difficultyParams: {
    mean: {
      type: Number,
      required: true,
      default: 750
    },
    sd: {
      type: Number,
      required: true,
      default: 150
    },
    alpha: {
      type: Number,
      required: true,
      default: 5
    }
  }
}, { timestamps: true });

// Index for faster queries
LevelSchema.index({ chapterId: 1 });

export const Level = mongoose.model<ILevel>('Level', LevelSchema); 