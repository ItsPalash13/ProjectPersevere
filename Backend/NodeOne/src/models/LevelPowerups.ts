import mongoose, { Schema, Document } from 'mongoose';

export interface ILevelPowerups extends Document {
  levelId: mongoose.Types.ObjectId;
  powerupId: mongoose.Types.ObjectId;
  status: boolean;
}

export const LevelPowerupsSchema = new Schema<ILevelPowerups>({
  levelId: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  powerupId: {
    type: Schema.Types.ObjectId,
    ref: 'Powerups',
    required: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
LevelPowerupsSchema.index({ levelId: 1, powerupId: 1 }, { unique: true });
LevelPowerupsSchema.index({ status: 1 });

export const LevelPowerups = mongoose.model<ILevelPowerups>('LevelPowerups', LevelPowerupsSchema);
