import { Router } from "express";
import { downloadFile, uploadFile } from "../controllers/file/file";
import multer from "multer";
import path from "path";
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (!req.headers.userId) {
            return cb(new Error('User ID is missing in request headers'), '');
        }

        const uploadDir = path.join(__dirname, `../../files/${req.headers.userId}`);

        // Check if the directory exists, create it if not
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);

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