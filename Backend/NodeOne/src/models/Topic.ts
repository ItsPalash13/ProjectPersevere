import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  chapterId: mongoose.Types.ObjectId;
  topic: string;
}

export const TopicSchema = new Schema<ITopic>({
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  topic: { 
    type: String, 
    required: true,
    // This is the topic name
  }
}, { timestamps: true });

// Index for faster queries
TopicSchema.index({ chapterId: 1 });

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema); 