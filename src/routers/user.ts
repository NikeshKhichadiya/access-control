import { Router } from "express";
import { canAccessDataToken, dataTokenLogin, login, removeDataTokenAccess, signup } from "../controllers/user";

const userRouter = Router();

userRouter.post('/sign-up', signup);
userRouter.post('/login', login);
userRouter.post('/data-login', dataTokenLogin);
userRouter.post('/removeDataTokenAccess', removeDataTokenAccess);
userRouter.post('/canAccessDataTokens', canAccessDataToken);

export default userRouter;