import mongoose, { Schema, Document } from 'mongoose';

// Chapter Schema
interface IChapter extends Document {
  name: string;
  description: string;
  gameName: string;
  topics: string[];
  status: boolean;
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
}, { timestamps: true });

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema);
