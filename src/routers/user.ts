import { Router } from "express";
import { signup } from "../controllers/user/user";

const userRouter = Router();

userRouter.post('/sign-up', signup);

export default userRouter;