import { Schema, model } from "mongoose";

const userSchema = new Schema({

    email: { type: String, required: [true, "'Email' is a required field"] },
    password: { type: String, required: [true, "'Password' is a required field"] },
    country: { type: String, required: [true, "'Country' is a required field"] },
    region: { type: String, required: [true, "'Region' is a required field"] },
    timezone: { type: String, required: [true, "'Timezone' is a required field"] }

}, { versionKey: false });

export const User = model('users', userSchema);