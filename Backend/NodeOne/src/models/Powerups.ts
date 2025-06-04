import mongoose, { Schema, Document } from 'mongoose';

export interface IPowerups extends Document {
  name: string;
  description: string;
  type: 'timeBoost' | 'scoreMultiplier' | 'skipQuestion' | 'hint' | 'removeOptions';
  costXp: number;
  effect: {
    value: number;
    duration?: number;
    optionsToRemove?: number;  // Number of options to remove
  };
  status: boolean;
}

export const PowerupsSchema = new Schema<IPowerups>({
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
  type: {
    type: String,
    enum: ['timeBoost', 'scoreMultiplier', 'skipQuestion', 'hint', 'removeOptions'],
    required: true
  },            
  costXp: {
    type: Number,
    required: true
  },
  effect: {
    value: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      min: 0
    },
    optionsToRemove: {
      type: Number,
      min: 1,
      max: 2,
      required: function(this: any) {
        return this.type === 'removeOptions';
      }
    }
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
PowerupsSchema.index({ type: 1 });
PowerupsSchema.index({ status: 1 });

export const Powerups = mongoose.model<IPowerups>('Powerup', PowerupsSchema);
