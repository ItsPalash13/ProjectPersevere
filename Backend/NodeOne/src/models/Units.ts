import mongoose, { Schema, Document } from 'mongoose';

interface IUnit extends Document {
    name: string;
    description: string;
    status: boolean;
    chapterId: mongoose.Types.ObjectId;
    topics: mongoose.Types.ObjectId[];
}

const UnitSchema = new Schema<IUnit>({
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
    status: {
        type: Boolean,
        default: false
    },
    chapterId: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true
    },
    topics: {
        type: [Schema.Types.ObjectId],
        ref: 'Topic',
        required: true
    }
});

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema);