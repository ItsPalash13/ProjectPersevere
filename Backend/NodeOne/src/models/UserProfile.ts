import { User } from 'better-auth/types';
import mongoose, { Schema, Document } from 'mongoose';

// UserBadge subdocument schema and interface
interface UserBadge {
  badgeId: Schema.Types.ObjectId;
  level: number;
  userLevelSessionId: string;
  createdAt: Date;
}

const UserBadgeSchema = new Schema<UserBadge>({
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  level: { type: Number, required: true },
  userLevelSessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

// Define the interface for the UserProfile document
interface UserProfileDocument extends Document {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  health: number;
  totalXp: number;
  bio?: string;
  dob?: Date; // Added date of birth field (optional)
  badges: UserBadge[];
  dailyAttemptsStreak: number;
  lastAttemptDate: Date | null;
  dailyScorePR: number;
  uniqueCorrectQuestions: string[];
  uniqueTopics: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema for UserProfile
const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String },
    bio: { type: String },
    dob: { type: Date }, // Added date of birth field
    uniqueCorrectQuestions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question'
    }],
    uniqueTopics: [{
      type: Schema.Types.ObjectId,
      ref: 'Topic'
    }],
    dailyScorePR: { type: Number, default: 0 },
    dailyAttemptsStreak: { type: Number, default: 0 },
    lastAttemptDate: { type: Date, default: null },
    health: { type: Number, default: 6 },
    totalXp: { type: Number, default: 0 },
    badges: { type: [UserBadgeSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Create the Mongoose model for UserProfile
const UserProfile = mongoose.model<UserProfileDocument>('UserProfile', UserProfileSchema);

// Export the model and the document interface
export { UserProfile, UserProfileDocument };