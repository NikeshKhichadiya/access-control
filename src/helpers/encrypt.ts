import { promisify } from 'util';
import { config } from '../config';
import * as crypto from 'crypto';
import fs, { createReadStream, createWriteStream, accessSync, copyFileSync } from 'fs';
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

// export const chacha20EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {
//     const readStream = fs.createReadStream(inputFile);
//     const writeStream = fs.createWriteStream(outputFile);
//     const iv = crypto.randomBytes(12);
//     const cipher = crypto.createCipheriv('chacha20-poly1305', Buffer.from(config.chacha20_key, 'hex'), Buffer.from(config.chacha20_iv, 'hex'), { authTagLength: 16 });

//     writeStream.write(iv);

//     readStream.pipe(cipher).pipe(writeStream);

//     return new Promise((resolve, reject) => {
//         writeStream.on('finish', () => {
//             console.log('File encrypted successfully');
//             resolve('File encrypted successfully');
//         });

//         cipher.on('error', (error) => {
//             console.error('Encryption Error:', error.message);
//             reject(new Error('Encryption failed'));
//         });
//     });
// };

export const chacha20EncryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    const algorithm = 'chacha20-poly1305';

    const key = Buffer.from(config.chacha20_key, 'hex'); // 32 bytes
    const iv = Buffer.from(config.chacha20_iv, 'hex'); // 12 bytes
    const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength: 16 });
    const readStream = fs.createReadStream(inputFile);
    const writeStream = fs.createWriteStream(outputFile);

    writeStream.on('finish', () => {

        const authTag = cipher.getAuthTag();
        const fd = fs.openSync(outputFile, 'r+');
        fs.writeSync(fd, authTag, 0);
        fs.closeSync(fd);

    });

    readStream.pipe(cipher).pipe(writeStream);

    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    return 'File uploaded successfully';

}

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