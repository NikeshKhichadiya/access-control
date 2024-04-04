import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { sendResponse } from '../helpers/sendResponse';

export const middleware = (req: Request, res: Response, next: NextFunction) => {

    try {

        const token = req.headers['access-token'];
        if (!token) { return sendResponse(res, 401, 'Access token is missing') }
        const decoded = jwt.verify(token as string, config.secretkey) as { [key: string]: any };

        if (decoded) { next(); }
        else { return sendResponse(res, 403, 'Invalid token'); }

    } catch (error: any) {

        console.error('JWT Error:', error.message);
        return sendResponse(res, 403, 'Invalid token');

    }

};
