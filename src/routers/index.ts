import { Express } from "express"
import userRouter from "./user"

export const router = (app: Express): void => {

    app.use('/user', userRouter);

}