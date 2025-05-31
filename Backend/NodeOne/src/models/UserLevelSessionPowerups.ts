import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLevelSessionPowerups extends Document {
  userLevelSessionId: mongoose.Types.ObjectId;
  powerupId: mongoose.Types.ObjectId;
  effect: {
    type: 'timeBoost' | 'scoreMultiplier' | 'skipQuestion' | 'hint' | 'removeOptions';
    value: number;
    duration: number;
    optionsToRemove?: number;
  };
  expiresAt?: Date;
}

export const UserLevelSessionPowerupsSchema = new Schema<IUserLevelSessionPowerups>({
  userLevelSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'UserLevelSession',
    required: true
  },
  powerupId: {
    type: Schema.Types.ObjectId,
    ref: 'Powerups',
    required: true
  },
  effect: {
    type: {
      type: String,
      required: true,
      enum: ['timeBoost', 'scoreMultiplier', 'skipQuestion', 'hint', 'removeOptions']
    },
    value: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    optionsToRemove: {
      type: Number,
      min: 1,
      max: 3,
      required: function(this: any) {
        return this.effect.type === 'removeOptions';
      }
    }
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
UserLevelSessionPowerupsSchema.index({ userLevelSessionId: 1});
UserLevelSessionPowerupsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const UserLevelSessionPowerups = mongoose.model<IUserLevelSessionPowerups>('UserLevelSessionPowerups', UserLevelSessionPowerupsSchema);
