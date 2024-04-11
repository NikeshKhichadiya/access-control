import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../helpers/sendResponse';
import { createFileID } from '../../helpers/fileHash';
import { aes128DecryptFile, aes256DecryptFile, getFile, chacha20DecryptFile } from '../../helpers/decrypt';
import { aes128EncryptFile, aes256EncryptFile, storeFile, chacha20EncryptFile } from '../../helpers/encrypt';
import path, { join } from 'path';
import fs from 'fs';
import { tmpdir } from 'os';
import { File } from '../../models/file';
import { performance } from 'perf_hooks';
import { memoryUsage } from 'process';

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    if (!req.file) { return sendResponse(res, 400, 'No file uploaded'); }

    const { path } = req.file;
    const tempPath = join(tmpdir(), req.file.filename); // Temporary file path
    const fileId = await createFileID(path);

    // Copy the uploaded file to a temporary location
    await fs.promises.copyFile(path, tempPath);

    let result;
    let startTime, endTime, startMemory, endMemory;
    let encryptionName = '';

    try {

        startTime = performance.now();
        startMemory = memoryUsage().heapUsed;

        if (req.params['confidentiality'] === 'high') {

            const encryptedFile = `${path}.high.${fileId}`;
            result = await aes256EncryptFile(tempPath, encryptedFile);
            encryptionName = 'AES-256';

        }

        else if (req.params['confidentiality'] === 'medium') {

            const encryptedFile = `${path}.medium.${fileId}`;
            result = await aes128EncryptFile(tempPath, encryptedFile);
            encryptionName = 'AES-128';

        }

        else if (req.params['confidentiality'] === 'low') {

            const encryptedFile = `${path}.low.${fileId}`;
            result = await chacha20EncryptFile(tempPath, encryptedFile);
            encryptionName = 'Triple DES';

        }

        else if (req.params['confidentiality'] === 'none') {

            const encryptedFile = `${path}.none.${fileId}`;
            result = await storeFile(tempPath, encryptedFile);
            encryptionName = 'No encryption';

        }

        else {

            const encryptedFile = `${path}.medium.${fileId}`;
            result = await aes128EncryptFile(tempPath, encryptedFile);
            encryptionName = 'AES-128';

        }

        endTime = performance.now();
        endMemory = memoryUsage().heapUsed;

        // Output time, memory usage, and encryption name
        console.log(`Encryption Algorithm: ${encryptionName}`);
        console.log(`Time taken: ${endTime - startTime} milliseconds`);
        console.log(`Memory used: ${endMemory - startMemory} bytes`);

        // Create a new File document
        const newFile = new File({
            user_id: req.headers.userId,
            file_id: fileId,
            enc_level: req.params['confidentiality'] || 'medium',
            fileName: req.file.filename
        });

        // Save the new File document to the database
        await newFile.save();

    } catch (error: any) {
        console.error('Upload Error:', error.message);
        fs.unlinkSync(tempPath);
        return sendResponse(res, 500, 'File upload failed');
    }

    await fs.promises.unlink(path); // Delete the original uploaded file
    await fs.promises.unlink(tempPath); // Delete the temporary file

    sendResponse(res, 200, result);
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
        const { file_id } = req.body;
        const data = await File.findOne({ user_id: req.headers.userId, _id: file_id });

        if (!!data) {
            const filePath = path.join(__dirname, `../../../files/${req.headers.userId}/`, `${data?.fileName}.${data?.enc_level}.${data?.file_id}`);
            const decryptedFilePath = path.join(__dirname, `../../../temp/${req.headers.userId}/`, `${data?.fileName}.${data?.enc_level}.${data?.file_id}`);

            const filesDir = path.join(__dirname, `../../../files/${req.headers.userId}`);
            const tempDir = path.join(__dirname, '../../../temp');

            if (!fs.existsSync(filesDir)) { fs.mkdirSync(filesDir, { recursive: true }); }
            if (!fs.existsSync(tempDir)) { fs.mkdirSync(tempDir, { recursive: true }); }

            if (!fs.existsSync(filePath)) { return sendResponse(res, 404, 'Encrypted file not found'); }

            switch (data.enc_level) {
                case 'high': await aes256DecryptFile(filePath, decryptedFilePath); break;
                case 'medium': await aes128DecryptFile(filePath, decryptedFilePath); break;
                case 'low': await chacha20DecryptFile(filePath, decryptedFilePath); break;
                case 'none': await getFile(filePath, decryptedFilePath); break;
                default: await aes128DecryptFile(filePath, decryptedFilePath); break;
            }

            if (!fs.existsSync(decryptedFilePath)) { return sendResponse(res, 400, 'Decryption failed'); }

            res.setHeader('Content-Disposition', `attachment; filename=${data?.fileName || ''}`);
            res.setHeader('Content-Type', 'application/octet-stream');

            const fileStream = fs.createReadStream(decryptedFilePath);
            fileStream.pipe(res);

            setTimeout(() => { fs.unlinkSync(decryptedFilePath) }, 100);
        } else {
            sendResponse(res, 400, 'No file found');
        }
    } catch (error) {
        console.error("Decryption Error:", error);
        sendResponse(res, 500, 'Decryption failed');
    }

};
