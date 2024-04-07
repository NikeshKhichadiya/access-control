import fs from 'fs';
import CryptoJS from 'crypto-js';
import { config } from '../config';

export const aes256DecryptFile = async (inputFile: string, outputFile: string): Promise<void> => {

    try {

        const key = config.aes256key;
        const encryptedContent = await fs.promises.readFile(inputFile, 'binary');
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, key, {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7,
            keySize: 256 / 32
        });

        const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8);
        await fs.promises.writeFile(outputFile, decryptedContent, 'binary');

    }
    catch (error: any) {

        console.error('Decryption Error:', error.message);
        throw error;

    }

};
