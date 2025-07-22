
import mongoose, { Schema, Document } from 'mongoose';

interface IBadgeLevel {
    milestone: number;
    badgeImage: string;
}

interface IBadge extends Document {
    badgeName: string;
    badgeType: 'daily' | 'global' | 'end' | 'social';
    badgeslug: string;
    badgeDescription: string;

    badgelevel: IBadgeLevel[];
}

const BadgeLevelSchema: Schema = new Schema({
    milestone: { type: Number, required: true },
    badgeImage: { type: String, required: true },
}, { _id: false });

const BadgeSchema: Schema = new Schema({
    badgeName: { type: String, required: true },
    badgeType: { type: String, required: true, enum: ['daily', 'global', 'end', 'social'] },
    badgeslug: { type: String, required: true },
    badgeDescription: { type: String, required: true },
    badgelevel: { type: [BadgeLevelSchema], default: [] },

});

export default mongoose.model<IBadge>('Badge', BadgeSchema);