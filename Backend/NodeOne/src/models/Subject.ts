import mongoose, { Schema, Document } from 'mongoose';

// Subject Schema
export interface ISubject extends Document {
  name: string;
  description: string;
  slug: string;
  status: boolean;
}

const SubjectSchema = new Schema<ISubject>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  status: {
    type: Boolean,
    default: true  
  },
}, { timestamps: true });

// Index for faster queries
SubjectSchema.index({ slug: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema); 