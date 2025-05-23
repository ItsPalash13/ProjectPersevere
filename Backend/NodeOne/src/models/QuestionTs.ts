import mongoose, { Schema, Document } from 'mongoose';

interface IDifficulty {
  mu: number;    // Mean of the difficulty rating
  sigma: number; // Standard deviation of the difficulty rating
}

interface IQuestionTs extends Document {
  quesId: mongoose.Types.ObjectId;
  difficulty: IDifficulty;
}

const DifficultySchema = new Schema<IDifficulty>({
  mu: { type: Number, required: true, default: 936 },
  sigma: { type: Number, required: true, default: 200 }
}, { _id: false });  // Disable _id for difficulty subdocument

const QuestionTsSchema = new Schema<IQuestionTs>({
  quesId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Question'  // Reference to the Question model
  },
  difficulty: { 
    type: DifficultySchema, 
    required: true 
  }
});

const QuestionTs = mongoose.model<IQuestionTs>('QuestionsTs', QuestionTsSchema);

export { QuestionTs, IQuestionTs, IDifficulty };
