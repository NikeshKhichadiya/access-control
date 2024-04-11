import { Router } from "express";
import { login, signup } from "../controllers/user";

const userRouter = Router();

userRouter.post('/sign-up', signup);
userRouter.post('/login', login);

export default userRouter;