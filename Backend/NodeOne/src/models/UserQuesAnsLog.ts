import mongoose, { Schema, Document } from 'mongoose';

interface ISkillRating {
  mu: number;    // Mean of the rating
  sigma: number; // Standard deviation of the rating
}

interface IQuestionData {
  options: string[];
  correct: number;
  userAns: number;
}

interface IUserQuesAnsLog extends Document {
  userId: mongoose.Types.ObjectId;
  quesId: mongoose.Types.ObjectId;
  userPrevTs: ISkillRating;
  userNewTs: ISkillRating;
  quesPrevTs: ISkillRating;
  quesNewTs: ISkillRating;
  questionData: IQuestionData;
  timestamp: Date;
}

const SkillRatingSchema = new Schema<ISkillRating>({
  mu: { type: Number, required: true },
  sigma: { type: Number, required: true }
}, { _id: false });

const QuestionDataSchema = new Schema<IQuestionData>({
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true },
  userAns: { type: Number, required: true }
}, { _id: false } );

const UserQuesAnsLogSchema = new Schema<IUserQuesAnsLog>({
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Userts'
  },
  quesId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Question'
  },
  userPrevTs: { 
    type: SkillRatingSchema, 
    required: true 
  },
  userNewTs: { 
    type: SkillRatingSchema, 
    required: true 
  },
  quesPrevTs: { 
    type: SkillRatingSchema, 
    required: true 
  },
  quesNewTs: { 
    type: SkillRatingSchema, 
    required: true 
  },
  questionData: { 
    type: QuestionDataSchema, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const UserQuesAnsLog = mongoose.model<IUserQuesAnsLog>('UserQuesAnsLog', UserQuesAnsLogSchema);

export { UserQuesAnsLog, IUserQuesAnsLog, ISkillRating, IQuestionData };
