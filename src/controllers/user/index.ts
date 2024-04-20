import { Request, Response } from "express";
import _ from "lodash";
import { sendResponse } from "../../helpers/sendResponse";
import { User } from "../../models/user";
import { UserState } from "./user.model";
import { userValidation } from "./user.validation";
import { generateDataToken, generateToken } from "../../middleware/token";
import { location } from "../../helpers/location";

let dataPicker = (data: any): UserState => {

    return _.pick(data, ['email', 'password'])

}

export const signup = async (req: Request, res: Response): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const locationData = location(req.ip || '');
    if (!locationData) { return sendResponse(res, 500, 'Internal Server Error') }

    const user = await User.findOne({ email: data.email });
    if (!!user) { return sendResponse(res, 400, 'User already exist') }

    data = { ...data, ..._.pick(locationData, ['country', 'region', 'timezone']) }

    await new User(data).save();
    sendResponse(res, 200, 'User registered successfully');

}

export const login = async (req: Request, res: Response): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const locationData = location(req.ip || '');
    if (!locationData) { return sendResponse(res, 500, 'Internal Server Error') }

    const user = await User.findOne({ email: data.email, password: data.password, country: locationData.country, timezone: locationData.timezone, region: locationData.region });

    if (!!user) {

        let payload = {
            _id: user._id
        }

        const token: string = generateToken(payload);

        if (!!token) {

            res.setHeader('access-token', token);
            return sendResponse(res, 200, 'Login successfully')

        }

    }

    return sendResponse(res, 400, 'Invalid credentials');

}

export const dataTokenLogin = async (req: Request, res: Response): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const user = await User.findOne({ email: data.email, password: data.password });
    if (!!user) {

        let payload = {
            _id: user._id,
            country: user.country,
            region: user.region,
            timezone: user.timezone
        }

        const token: string = generateDataToken(payload);

        if (!!token) {

            res.setHeader('access-data-token', token);
            return sendResponse(res, 200, 'Login successfully')

        }

    }

    return sendResponse(res, 400, 'Invalid credentials');

}