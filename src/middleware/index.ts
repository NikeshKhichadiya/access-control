import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { sendResponse } from '../helpers/sendResponse';
import { location } from '../helpers/location';
import { DataToken } from '../models/dataToken';

export const middleware = (req: Request, res: Response, next: NextFunction) => {

    try {

        const token = req.headers['access-token'];
        if (!token) { return sendResponse(res, 401, 'Unauthorized access') }
        const decoded = jwt.verify(token as string, config.secretkey) as { [key: string]: any };

        if (decoded) {

            req.headers.userId = decoded._id;
            next();

        }
        else { return sendResponse(res, 401, 'Unauthorized access'); }

    } catch (error: any) {

        console.error('JWT Error:', error.message);
        return sendResponse(res, 401, 'Unauthorized access');

    }

};

export const decodeDataToken = async (user_id: string, token: string | any, ip: string): Promise<boolean> => {

    try {

        if (!token) { return false }
        const decoded = jwt.verify(token as string, config.dataTokenSecreateKey) as { [key: string]: any };

        if (decoded) {

            if (user_id !== decoded.user_id) { return false }
            const locationData = location(ip);
            // if (decoded.country !== locationData.country || decoded.region !== locationData.region || decoded.timezone !== locationData.timezone) { return false }

            const dataToken = await DataToken.findOne({ user_id: user_id });
            if (!!dataToken) { return true }

            return false
        }

        else { return false }

    }

    catch (error: any) {

        return false

    }

}
