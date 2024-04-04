import { Router } from "express";
import { login, signup, getAllUsers } from "../controllers/user/user";
import { middleware } from "../middleware";

const userRouter = Router();

userRouter.post('/sign-up', signup);
userRouter.post('/login', login);
userRouter.get('/all', middleware, getAllUsers);

export default userRouter;