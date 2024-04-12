import { Request, Response } from 'express';
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
import _ from 'lodash';
import { FileState } from './file.model';
import { fileValidation } from './file.validation';
import { FileAccess } from '../../models/fileAccess';

const dataPicker = (data: any): FileState => {

    return _.pick(data, ['file_id'])

}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    // Check if a file was uploaded
    if (!req.file) {
        return sendResponse(res, 400, 'No file uploaded');
    }

    // Extract file path and create a temporary file path
    const { path, filename } = req.file;
    const tempPath = join(tmpdir(), filename);

    // Generate a unique file ID
    const fileId = await createFileID(path);

    // Copy the uploaded file to a temporary location
    await fs.promises.copyFile(path, tempPath);

    let result;
    let startTime, endTime;
    let encryptionName = '';

    try {
        // Start measuring time
        startTime = performance.now();

        // Measure memory usage before the encryption process
        const startMemoryUsage = process.memoryUsage().heapUsed;

        // Determine the encryption level based on the request parameter
        switch (req.params['confidentiality']) {
            case 'high':
                const encryptedFileHigh = `${path}.high.${fileId}`;
                result = await aes256EncryptFile(tempPath, encryptedFileHigh);
                encryptionName = 'AES-256';
                break;

            case 'medium':
                const encryptedFileMedium = `${path}.medium.${fileId}`;
                result = await aes128EncryptFile(tempPath, encryptedFileMedium);
                encryptionName = 'AES-128';
                break;

            case 'low':
                const encryptedFileLow = `${path}.low.${fileId}`;
                result = await chacha20EncryptFile(tempPath, encryptedFileLow);
                encryptionName = 'ChaCha20';
                break;

            case 'none':
                const encryptedFileNone = `${path}.none.${fileId}`;
                result = await storeFile(tempPath, encryptedFileNone);
                encryptionName = 'No encryption';
                break;

            default:
                const encryptedFileDefault = `${path}.medium.${fileId}`;
                result = await aes128EncryptFile(tempPath, encryptedFileDefault);
                encryptionName = 'AES-128';
                break;
        }

        // Measure memory usage after the encryption process
        const endMemoryUsage = process.memoryUsage().heapUsed;

        // Stop measuring time
        endTime = performance.now();

        // Log encryption details
        console.log(`Encryption Algorithm: ${encryptionName}`);
        console.log(`File Name: ${filename}`);
        console.log(`Time taken: ${endTime - startTime} milliseconds`);
        console.log(" ")

        // Create a new File document
        const newFile = new File({
            user_id: req.headers.userId,
            file_id: fileId,
            enc_level: req.params['confidentiality'] || 'medium',
            fileName: filename // Include file name
        });

        // Save the new File document to the database
        await newFile.save();

    } catch (error: any) {
        // Handle upload errors
        console.error('Upload Error:', error.message);
        fs.unlinkSync(tempPath); // Delete the temporary file
        return sendResponse(res, 500, 'File upload failed');
    }

    // Delete the original uploaded file and the temporary file
    await fs.promises.unlink(path);
    await fs.promises.unlink(tempPath);

    // Send the response
    sendResponse(res, 200, result);
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {

    let { file_id }: FileState = dataPicker(req.body);
    let { error } = await fileValidation(req.body);
    if (error) throw error;

    const user_id = req.headers.userId;
    const data = await File.findOne({ user_id: user_id, _id: file_id });

    if (!!data) {

        const filePath = path.join(__dirname, `../../../files/${user_id}/`, `${data?.fileName}.${data?.enc_level}.${data?.file_id}`);
        const decryptedFilePath = path.join(__dirname, `../../../temp/${user_id}/`, `${data?.fileName}.${data?.enc_level}.${data?.file_id}`);

        const filesDir = path.join(__dirname, `../../../files/${user_id}`);
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
    }

    else { sendResponse(res, 400, 'No file found'); }

};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {

    const file_id = req.body.file_id;
    const user_id = req.headers.userId;

    // Find the file metadata in the database
    const fileData = await File.findOne({ _id: file_id, user_id: user_id });
    if (!fileData) { return sendResponse(res, 400, 'File not found') };

    const filePath = path.join(__dirname, `../../../files/${user_id}/`, `${fileData?.fileName}.${fileData?.enc_level}.${fileData?.file_id}`);

    if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }

    // Delete the file metadata from the database
    await File.deleteOne({ _id: file_id });
    await FileAccess.deleteMany({ file_id: file_id })

    sendResponse(res, 200, 'File deleted successfully');

};