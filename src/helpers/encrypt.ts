import fs from 'fs';
import CryptoJS from 'crypto-js';
import { promisify } from 'util';
import { config } from '../config';
import * as crypto from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';

const pipelineAsync = promisify(pipeline);

export const aes256EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {
        const key: string = config.aes256key;

        const readStream = createReadStream(inputFile);
        const writeStream = createWriteStream(outputFile);

        const cipher = crypto.createCipheriv('aes-256-cfb', Buffer.from(key, 'hex'), Buffer.alloc(16));
        await pipelineAsync(readStream, cipher, writeStream);

        return 'File uploaded successfully';

    } catch (error: any) {

        console.error('Encryption Error:', error.message);
        throw new Error('Encryption failed');

    }
};

export const aes128EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {

        const key: string = config.aes128key;

        const readStream = createReadStream(inputFile);
        const writeStream = createWriteStream(outputFile);

        const cipher = crypto.createCipheriv('aes-128-cfb', Buffer.from(key, 'hex'), Buffer.alloc(16));

        await pipelineAsync(readStream, cipher, writeStream);
        return 'File uploaded successfully';

    } catch (error: any) {

        console.error('Encryption Error:', error.message);
        throw new Error('Encryption failed');

    }

};

export const chacha20EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {

        const readStream = fs.createReadStream(inputFile);
        const writeStream = fs.createWriteStream(outputFile);

        // Generate a random 12-byte nonce
        const iv = crypto.randomBytes(12);

        // Create a ChaCha20-Poly1305 cipher object
        const cipher = crypto.createCipheriv('chacha20-poly1305', Buffer.from(config.chacha20_key, 'hex'), iv, {
            authTagLength: 16
        });

        // Pipe the input file stream through the cipher and then to the output file stream
        readStream.pipe(cipher).pipe(writeStream);

        // Wait for the encryption process to finish
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        return 'File encrypted successfully';

    } catch (error: any) {
        // Log and throw an error if encryption fails
        console.error('Encryption Error:', error.message);
        throw new Error('Encryption failed');
    }
};

export const storeFile = async (inputFile: string, outputFile: string): Promise<string> => {
    try {
        // Check if the input file exists
        const fileExists = await fs.promises.access(inputFile).then(() => true).catch(() => false);
        if (!fileExists) {
            throw new Error('Input file does not exist');
        }

        // Copy file from input path to output path
        await fs.promises.copyFile(inputFile, outputFile);

        return 'File uploaded successfully';
    }
    catch (error: any) {
        console.error('File Storage Error:', error.message);
        throw new Error('File storage failed');
    }
};