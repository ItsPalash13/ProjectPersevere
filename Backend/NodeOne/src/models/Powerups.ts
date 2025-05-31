import mongoose, { Schema, Document } from 'mongoose';

export interface IPowerups extends Document {
  name: string;
  description: string;
  type: 'score' | 'streak';
  thresholds: {
    scoreThreshold?: number;
    scoreWindowMs?: number;
    streakThreshold?: number;
    streakWindowMs?: number;
  };
  effect: {
    type: 'timeBoost' | 'scoreMultiplier' | 'skipQuestion' | 'hint' | 'removeOptions';
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
    enum: ['score', 'streak'],
    required: true
  },
  thresholds: {
    scoreThreshold: {
      type: Number,
      min: 0,
      required: function() {
        return this.type === 'score';
      }
    },
    scoreWindowMs: {
      type: Number,
      min: 0,
      required: function() {
        return this.type === 'score';
      }
    },
    streakThreshold: {
      type: Number,
      min: 0,
      required: function() {
        return this.type === 'streak';
      }
    },
    streakWindowMs: {
      type: Number,
      min: 0,
      required: function() {
        return this.type === 'streak';
      }
    }
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
      min: 0
    },
    optionsToRemove: {
      type: Number,
      min: 1,
      max: 2,
      required: function(this: any) {
        return this.effect.type === 'removeOptions';
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

export const Powerups = mongoose.model<IPowerups>('Powerups', PowerupsSchema);
