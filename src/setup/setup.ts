import express, { Express, json, urlencoded } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import { router } from '../routers';
import { urlNotFound } from '../helpers/urlNotFound';
import { errorHandler } from '../helpers/errorHandler';
import { dbConnection } from '../db/db';
import path from 'path';

export const setup = async (app: Express): Promise<void> => {

    await dbConnection();
    app.use(cors());
    app.use(helmet());
    app.use(json())
    app.use(urlencoded({ extended: true }));
    router(app);
    app.use(urlNotFound);
    app.use(errorHandler);
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

}