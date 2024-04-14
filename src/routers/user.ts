import { Router } from "express";
import { dataTokenLogin, login, signup } from "../controllers/user";

const userRouter = Router();

userRouter.post('/sign-up', signup);
userRouter.post('/login', login);
userRouter.post('/data-login', dataTokenLogin);

export default userRouter;