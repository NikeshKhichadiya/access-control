import { Request, Response } from "express";
import _ from "lodash";
import { sendResponse } from "../../helpers/sendResponse";
import { User } from "../../models/user";
import { UserState } from "./user.model";
import { userValidation } from "./user.validation";
import { generateDataToken, generateToken } from "../../middleware/token";
import { location } from "../../helpers/location";
import { DataToken } from "../../models/dataToken";

let dataPicker = (data: any): UserState => {

    return _.pick(data, ['email', 'password'])

}

export const signup = async (req: Request, res: Response): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const locationData = location(req.ip || '');
    // if (!locationData) { return sendResponse(res, 500, 'Internal Server Error') }

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
    // if (!locationData) { return sendResponse(res, 500, 'Internal Server Error') }

    const user = await User.findOne({ email: data.email, password: data.password });
    // const user = await User.findOne({ email: data.email, password: data.password, country: locationData.country, timezone: locationData.timezone, region: locationData.region });

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

    if (!user?.canGenerateDataToken) { return sendResponse(res, 400, 'You are not authorized for some time') }

    if (!!user) {

        let payload = {
            user_id: user._id,
            country: user.country,
            region: user.region,
            timezone: user.timezone
        }

        const token: string = generateDataToken(payload);

        if (!!token) {

            const response = await DataToken.findOneAndUpdate(
                { user_id: user._id },
                { $set: { user_id: user._id } },
                { upsert: true, new: true }
            );

            if (!!response) {

                res.setHeader('access-data-token', token);
                return sendResponse(res, 200, 'Login successfully')

            }

            else { return sendResponse(res, 400, 'Invalid credentials'); }

        }

    }

    return sendResponse(res, 400, 'Invalid credentials');

}

export const removeDataTokenAccess = async (req: Request, res: Response): Promise<void> => {

    const response = await DataToken.findOneAndDelete({ user_id: req.body.user_id });
    await User.findByIdAndUpdate(req.body.user_id, { canGenerateDataToken: false })
    if (!!response) { return sendResponse(res, 200, 'Remove token successfully') }
    else { sendResponse(res, 400, 'token not found') }

}

export const canAccessDataToken = async (req: Request, res: Response): Promise<void> => {

    const response = await User.findByIdAndUpdate(req.body.user_id, { canGenerateDataToken: true })
    if (!!response) { return sendResponse(res, 200, 'Can generate token successfully') }
    else { sendResponse(res, 400, 'user not found') }

}