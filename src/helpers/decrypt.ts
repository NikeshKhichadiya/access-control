import { config } from '../config';
import path from 'path';
import fs, { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import crypto from 'crypto';

const pipelineAsync = promisify(pipeline);

export const aes256DecryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {

        const key: string = config.aes256key;

        const outputDir = path.dirname(outputFile);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const readStream = createReadStream(inputFile);
        const writeStream = createWriteStream(outputFile);
        const decipher = crypto.createDecipheriv('aes-256-cfb', Buffer.from(key, 'hex'), Buffer.alloc(16));
        await pipelineAsync(readStream, decipher, writeStream);

        return 'File decrypted successfully';

    } catch (error: any) {

        console.error('Decryption Error:', error.message);
        throw new Error('Decryption failed');

    }
};

export const aes128DecryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    try {

        const key: string = config.aes128key;

        const outputDir = path.dirname(outputFile);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const readStream = createReadStream(inputFile);
        const writeStream = createWriteStream(outputFile);

        const decipher = crypto.createDecipheriv('aes-128-cfb', Buffer.from(key, 'hex'), Buffer.alloc(16));

        await pipelineAsync(readStream, decipher, writeStream);
        return 'File decrypted successfully';

    } catch (error: any) {

        console.error('Decryption Error:', error.message);
        throw new Error('Decryption failed');

    }
};

// export const chacha20DecryptFile = async (inputFile: string, outputFile: string): Promise<void> => {
//     try {
//         // Read the encrypted data from the input file
//         const encryptedDataHex = await fs.promises.readFile(inputFile, 'utf8');

//         // Convert the encrypted data from hexadecimal string to Buffer
//         const encryptedData = Buffer.from(encryptedDataHex, 'hex');

//         // Extract the IV, authentication tag, and encrypted data
//         const iv = encryptedData.slice(0, 12);
//         const tag = encryptedData.slice(12, 28);
//         const encryptedDataOnly = encryptedData.slice(28);

//         // Create a ChaCha20-Poly1305 decipher object
//         const decipher = crypto.createDecipheriv('chacha20-poly1305', Buffer.from(config.chacha20_key, 'hex'), iv, {
//             authTagLength: 16
//         });

//         // Set the authentication tag
//         decipher.setAuthTag(tag);

//         // Decrypt the data buffer
//         const decryptedData = Buffer.concat([
//             decipher.update(encryptedDataOnly),
//             decipher.final()
//         ]);

//         // Write the decrypted data to the output file
//         await fs.promises.writeFile(outputFile, decryptedData);

//         console.log('File decrypted successfully');
//     } catch (error: any) {
//         // Log and throw an error if decryption fails
//         console.error('Decryption Error:', error.message);
//         throw new Error('Decryption failed');
//     }
// };

export const chacha20DecryptFile = async (inputFile: string, outputFile: string): Promise<string> => {

    const algorithm = 'chacha20-poly1305';
    const key = Buffer.from(config.chacha20_key, 'hex'); // 32 bytes
    const iv = Buffer.from(config.chacha20_iv, 'hex'); // 12 bytes
    const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength: 16 });

    const outputDir = path.dirname(outputFile);
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    // Read the authentication tag from the input file
    const readStreamAuth = fs.createReadStream(inputFile, { start: 0, end: 15 });
    let first16Bytes = '';
    await new Promise((resolve, reject) => {
        readStreamAuth.on('data', (chunk) => {
            first16Bytes += chunk.toString('hex');
        });
        readStreamAuth.on('end', resolve);
        readStreamAuth.on('error', reject);
    });

    // Set the authentication tag
    decipher.setAuthTag(Buffer.from(first16Bytes, 'hex'));

    // Create a write stream for the decrypted output
    const writeStream = fs.createWriteStream(outputFile);

    // Create a read stream for the input file (starting from the 16th byte)
    const readStream = fs.createReadStream(inputFile, { start: 16 });

    // Pipe the read stream through the decipher to the write stream
    readStream.pipe(decipher).on('readable', () => {
        let chunk;
        while (null !== (chunk = decipher.read())) {
            writeStream.write(chunk);
        }
    });

    // Wait for the write stream to finish
    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    return 'File decrypted successfully';
}


export const getFile = async (inputFile: string, outputFile: string): Promise<void> => {

    try {

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