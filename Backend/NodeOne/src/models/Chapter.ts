import mongoose, { Schema, Document } from 'mongoose';

// Level Schema
interface ILevel extends Document {
  name: string;
  description: string;
  requiredXP: number;
  topics: string[];
}

const LevelSchema = new Schema<ILevel>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  requiredXP: { 
    type: Number, 
    required: true,
    min: 0
  },
  topics: [{ 
    type: String,
    required: true,
    trim: true
  }]
});

// Chapter Schema
interface IChapter extends Document {
  name: string;
  gameName: string;
  topics: string[];
  levels: ILevel[];
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  gameName: { 
    type: String, 
    required: true,
    trim: true
  },
  topics: [{ 
    type: String,
    required: true,
    trim: true
  }],
  levels: [LevelSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
ChapterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema);
