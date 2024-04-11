import { Router } from "express";
import { giveFileAccess, removeFileAccess } from "../controllers/fileAccess";

const fileAccessRouter = Router();

fileAccessRouter.post('/add', giveFileAccess);
fileAccessRouter.post('/remove', removeFileAccess);

export default fileAccessRouter;