import { Schema, model, Types } from "mongoose";

const fileAccessSchema = new Schema({
    user_id: {
        type: Types.ObjectId,
        required: [true, "'user_id' is a required field"],
        ref: 'User'
    },
    file_id: {
        type: Types.ObjectId,
        required: [true, "'file_id' is a required field"],
        ref: 'File'
    },
    access_type: {
        type: String,
        required: [true, "'access_type' is a required field"],
        enum: ['read', 'write'],
        trim: true
    }
}, {
    versionKey: false,
    timestamps: true,
    collection: 'file_access'
});

export const FileAccess = model('file_access', fileAccessSchema);