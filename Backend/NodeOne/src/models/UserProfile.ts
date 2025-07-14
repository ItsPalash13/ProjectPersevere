import mongoose, { Schema, Document } from 'mongoose';

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
    health: { type: Number, default: 6 },
    totalXp: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Create the Mongoose model for UserProfile
const UserProfile = mongoose.model<UserProfileDocument>('UserProfile', UserProfileSchema);

// Export the model and the document interface
export { UserProfile, UserProfileDocument };