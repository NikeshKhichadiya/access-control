import { Schema, model, Types } from "mongoose";

const dataToken = new Schema({
    user_id: {
        type: Types.ObjectId,
        required: [true, "'user_id' is a required field"],
        ref: 'User'
    }
}, {
    versionKey: false,
    timestamps: true
});

export const DataToken = model('data_token', dataToken);