import mongoose from "mongoose";
import { config } from "../config";

export const dbConnection = async (): Promise<void> => {

    const dbName = config?.db?.name || 'practice';
    const username = config?.username;
    const password = config?.password;

    try {

        await mongoose.connect(`mongodb+srv://${username}:${password}@access-control.jbqqhbi.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=access-control`);
        console.log('Database connected successfully');

    }
    catch (e) {

        console.log(e);
        console.log('Database connection error');
        process.exit();

    }

} 