import fs from 'fs';
import CryptoJS from 'crypto-js';
import { promisify } from 'util';
import { config } from '../config';

const readFileSync = promisify(fs.readFile);
const writeFileSync = promisify(fs.writeFile);

export const aes256EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {

        const key = config.aes256key;
        const fileContent = await readFileSync(inputFile);
        const wordArray = CryptoJS.enc.Utf8.parse(fileContent.toString());
        const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7,
            keySize: 256 / 32
        });

        await writeFileSync(outputFile, encrypted.toString());

        return 'File uploaded successfully';

    }
    catch (error: any) {

        console.error('Encryption Error:', error.message);
        throw new Error('Encryption failed');

    }

};

export const aes128EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {

        const key = config.aes128key;
        const fileContent = await readFileSync(inputFile);

        const wordArray = CryptoJS.enc.Utf8.parse(fileContent.toString());

        const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7,
            keySize: 128 / 8
        });

        await writeFileSync(outputFile, encrypted.toString());
        return 'File uploaded successfully';

    }

    catch (error: any) {
        console.error('Encryption Error:', error.message);
        throw new Error('Encryption failed');
    }

};

import * as crypto from 'crypto';

export const chacha20EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {
    try {
        // Read file content
        const fileContent = await fs.promises.readFile(inputFile, 'utf8');

        // Convert data string to buffer
        const dataBuffer = Buffer.from(fileContent, 'utf8');

        // Generate a random 12-byte nonce
        const iv = crypto.randomBytes(12);

        // Create a ChaCha20-Poly1305 cipher object
        const cipher = crypto.createCipheriv('chacha20-poly1305', Buffer.from(config.chacha20_key, 'hex'), iv, {
            authTagLength: 16
        });

        // Encrypt the data buffer
        const encryptedData = Buffer.concat([
            cipher.update(dataBuffer),
            cipher.final()
        ]);

        // Get the authentication tag
        const tag = cipher.getAuthTag();

        // Concatenate IV, tag, and encrypted data
        const finalData = Buffer.concat([iv, tag, encryptedData]).toString('hex');

        // Write the encrypted data to the output file
        await fs.promises.writeFile(outputFile, finalData);

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