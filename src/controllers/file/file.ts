import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../helpers/sendResponse';
import { aes256EncryptFile } from '../../helpers/encrypt';
import { aes256DecryptFile } from '../../helpers/decrypt';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

        if (!req.file) { return sendResponse(res, 400, 'No file uploaded'); }

        const { path } = req.file;
        const encryptedFile = `${path}.enc`;
        const result = await aes256EncryptFile(path, encryptedFile);

        fs.unlinkSync(path);
        sendResponse(res, 200, result);

    } catch (error) {

        console.log('Error:', error);
        sendResponse(res, 500, 'Internal server error');

    }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

        const { filename } = req.body;
        const filePath = path.join(__dirname, `../../../files/${req.headers.userId}`, filename);
        const decryptedFilePath = path.join(__dirname, '../../../temp/', filename);

        const filesDir = path.join(__dirname, `../../../files/${req.headers.userId}`);
        if (!fs.existsSync(filesDir)) { fs.mkdirSync(filesDir, { recursive: true }); }

        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) { fs.mkdirSync(tempDir, { recursive: true }); }

        if (!fs.existsSync(filePath)) { return sendResponse(res, 404, 'File not found'); }
        await aes256DecryptFile(filePath, decryptedFilePath);

        if (!fs.existsSync(decryptedFilePath)) { return sendResponse(res, 500, 'Decryption failed'); }

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const fileStream = fs.createReadStream(decryptedFilePath);
        fileStream.pipe(res);

        setTimeout(() => { fs.unlinkSync(decryptedFilePath) }, 100);

    }
    catch (error) {

        console.log('Error:', error);
        sendResponse(res, 500, 'Internal server error');
    }

};