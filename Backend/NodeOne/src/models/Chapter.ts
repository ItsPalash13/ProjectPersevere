import mongoose, { Schema, Document } from 'mongoose';

// Chapter Schema
interface IChapter extends Document {
  name: string;
  description: string;
  gameName: string;
  topics: string[];
  status: boolean;
  subjectId: mongoose.Types.ObjectId;
  units: mongoose.Types.ObjectId[];
  thumbnailUrl?: string;
}

const ChapterSchema = new Schema<IChapter>({
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
  status: {
    type: Boolean,
    default: false  
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: false,
    trim: true
  },
  units: [{
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  }]
}, { timestamps: true });

// Index for faster queries
ChapterSchema.index({ subjectId: 1 });

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema);
