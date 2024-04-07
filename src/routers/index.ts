import { Express } from "express"
import { middleware } from "../middleware";

import userRouter from "./user"
import fileRouter from "./file";

export const router = (app: Express): void => {

    app.use('/user', userRouter);
    app.use('/file', middleware, fileRouter);

}