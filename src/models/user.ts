import { Schema, model } from "mongoose";

const userSchema = new Schema({

    email: { type: String, require: [true, "'Email' is require field"] },
    password: { type: String, require: [true, "'Password' is require field"] },

}, { versionKey: false });

export const User = model('users', userSchema);