import fs from 'fs';
import CryptoJS from 'crypto-js';

export const aes256DecryptFile = async (key: string, inputFile: string, outputFile: string): Promise<void> => {

    try {

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
