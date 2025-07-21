import mongoose, { Schema, Document } from 'mongoose';

interface IQuestion extends Document {
  ques: string;
  options: string[];
  correct: number;
  chapterId: mongoose.Types.ObjectId; 
  topics: Array<{ id: mongoose.Types.ObjectId | string; name: string }>;
}

const QuestionSchema = new Schema<IQuestion>({
  ques: { 
    type: String, 
    required: true 
  },
  options: [{ 
    type: String, 
    required: true 
  }],
  correct: { 
    type: Number, 
    required: true,
    min: 0,
    max: 3  // Since options are 0-based index
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  topics: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }]
});

const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

export { Question, IQuestion };
