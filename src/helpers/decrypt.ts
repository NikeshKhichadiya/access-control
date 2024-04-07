import fs from 'fs';
import CryptoJS from 'crypto-js';
import { config } from '../config';
import path from 'path';

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

export const tripleDesDecryptFile = async (inputFile: string, outputFile: string): Promise<void> => {
    try {
        if (!fs.existsSync(inputFile)) {
            throw new Error('Encrypted file not found');
        }

        const key = config.tripleDesKey;
        const encryptedContent = await fs.promises.readFile(inputFile, 'binary');

        const outputDir = path.dirname(outputFile);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const decrypted = CryptoJS.TripleDES.decrypt(encryptedContent, key, {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8);
        await fs.promises.writeFile(outputFile, decryptedContent, 'binary');

    } catch (error: any) {
        console.error('Decryption Error:', error.message);
        throw error;
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