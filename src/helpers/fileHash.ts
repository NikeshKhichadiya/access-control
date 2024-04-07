import { createHash } from 'crypto';
import { createReadStream } from 'fs';

// Function to generate a SHA256 hash of a file
const getFileHash = (filePath: string): Promise<string> =>

    new Promise((resolve, reject) => {
        const hash = createHash('sha256');
        const input = createReadStream(filePath);

        input.on('error', (err) => {
            reject(err);
        });

        hash.once('readable', () => {
            const data = hash.read();
            resolve(data.toString('hex'));
        });

        input.pipe(hash);
    });

// Function to generate an ID based on the hash of a file
export const createFileID = async (filePath: string): Promise<string> => {

    try {
        const hash = await getFileHash(filePath);
        return hash;
    } catch (err) {
        console.error('Error generating file ID:', err);
        return '';
    }

};