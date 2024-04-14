import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (payload: any): string => {

    try {

        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
            throw new Error('Invalid payload data');
        }

        const token = jwt.sign(payload, config.secretkey, {
            expiresIn: '24h',
            algorithm: 'HS256'
        });

        if (token) { return token; }
        else { throw new Error('Token generation failed'); }

    } catch (error: any) {
        // Handle token generation errors
        console.error('JWT Error:', error.message);
        throw new Error('Failed to generate token');
    }

}

export const generateDataToken = (payload: any): string => {

    try {

        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
            throw new Error('Invalid payload data');
        }

        const token = jwt.sign(payload, config.dataTokenSecreateKey, {
            expiresIn: '24h',
            algorithm: 'HS256'
        });

        if (token) { return token; }
        else { throw new Error('Token generation failed'); }

    } catch (error: any) {
        // Handle token generation errors
        console.error('JWT Error:', error.message);
        throw new Error('Failed to generate token');
    }

}
