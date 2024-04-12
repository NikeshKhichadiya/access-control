import { Schema, model, Types } from "mongoose";

const fileSchema = new Schema({
    user_id: {
        type: Types.ObjectId,
        required: [true, "'user_id' is a required field"],
        ref: 'User'
    },
    file_id: {
        type: String,
        required: [true, "'file_id' is a required field"],
        trim: true
    },
    enc_level: {
        type: String,
        required: [true, "'enc_level' is a required field"],
        enum: ['high', 'medium', 'low', 'none'],
        trim: true
    },
    fileName: {
        type: String,
        required: [true, "'fileName' is a required field"],
        trim: true
    }
}, {
    versionKey: false,
    timestamps: true
});

export const File = model('File', fileSchema);