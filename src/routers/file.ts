import { Router } from "express";
import multer from "multer";
import { downloadFile, uploadFile } from "../controllers/file/file";
import path from "path";

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../files'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

const fileRouter = Router();

fileRouter.post('/upload', upload, uploadFile);
fileRouter.post('/download', downloadFile);

export default fileRouter;