import fs from 'fs';
import CryptoJS from 'crypto-js';
import { config } from '../config';
import path from 'path';
import * as crypto from 'crypto';

export const aes256DecryptFile = async (inputFile: string, outputFile: string): Promise<void> => {

    try {

        if (!fs.existsSync(inputFile)) { throw new Error('Encrypted file not found'); }

        const key = config.aes256key;
        const encryptedContent = await fs.promises.readFile(inputFile, 'binary');
        const outputDir = path.dirname(outputFile);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const decrypted = CryptoJS.AES.decrypt(encryptedContent, key, {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7,
            keySize: 256 / 32
        });

        const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8);
        await fs.promises.writeFile(outputFile, decryptedContent, 'binary');

    } catch (error: any) {
        throw error;
    }
};

export const aes128DecryptFile = async (inputFile: string, outputFile: string): Promise<void> => {
    try {
        if (!fs.existsSync(inputFile)) {
            throw new Error('Encrypted file not found');
        }

        const key = config.aes128key;
        const encryptedContent = await fs.promises.readFile(inputFile, 'binary');

        const outputDir = path.dirname(outputFile);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const decrypted = CryptoJS.AES.decrypt(encryptedContent, key, {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7,
            keySize: 128 / 32
        });

        const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8);
        await fs.promises.writeFile(outputFile, decryptedContent, 'binary');

    } catch (error: any) {
        console.error('Decryption Error:', error.message);
        throw error;
    }
};

export const chacha20DecryptFile = async (inputFile: string, outputFile: string): Promise<void> => {
    try {
        // Read the encrypted data from the input file
        const encryptedDataHex = await fs.promises.readFile(inputFile, 'utf8');

        // Convert the encrypted data from hexadecimal string to Buffer
        const encryptedData = Buffer.from(encryptedDataHex, 'hex');

        // Extract the IV, authentication tag, and encrypted data
        const iv = encryptedData.slice(0, 12);
        const tag = encryptedData.slice(12, 28);
        const encryptedDataOnly = encryptedData.slice(28);

        // Create a ChaCha20-Poly1305 decipher object
        const decipher = crypto.createDecipheriv('chacha20-poly1305', Buffer.from(config.chacha20_key, 'hex'), iv, {
            authTagLength: 16
        });

        // Set the authentication tag
        decipher.setAuthTag(tag);

        // Decrypt the data buffer
        const decryptedData = Buffer.concat([
            decipher.update(encryptedDataOnly),
            decipher.final()
        ]);

        // Write the decrypted data to the output file
        await fs.promises.writeFile(outputFile, decryptedData);

        console.log('File decrypted successfully');
    } catch (error: any) {
        // Log and throw an error if decryption fails
        console.error('Decryption Error:', error.message);
        throw new Error('Decryption failed');
    }
};

export const getFile = async (inputFile: string, outputFile: string): Promise<void> => {
    try {
        if (!fs.existsSync(inputFile)) {
            throw new Error('Input file not found');
        }

        const fileContent = await fs.promises.readFile(inputFile, 'binary');

        const outputDir = path.dirname(outputFile);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        await fs.promises.writeFile(outputFile, fileContent, 'binary');

    } catch (error: any) {
        console.error('Write File Error:', error.message);
        throw error;
    }
};