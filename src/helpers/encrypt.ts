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

        return 'File encrypted successfully';

    }
    catch (error: any) {

        console.error('Encryption Error:', error.message);
        throw new Error('Encryption failed');

    }

};
