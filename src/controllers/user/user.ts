import { Request, Response } from "express";
import _ from "lodash";
import { sendResponse } from "../../helpers/sendResponse";
import { User } from "../../models/user";
import { UserState } from "./user.model";
import { userValidation } from "./user.validation";
import { generateToken } from "../../middleware/token";

let dataPicker = (data: any): UserState => {

    return _.pick(data, ['email', 'password'])

}

export const signup = async (req: Request, res: Response): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const user = await User.findOne({ email: data.email });
    if (!!user) { return sendResponse(res, 400, 'User already exist') }

    await new User(data).save();
    sendResponse(res, 200, 'User registered successfully');

}

export const login = async (req: Request, res: Response): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const user = await User.findOne({ email: data.email, password: data.password });
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

    return sendResponse(res, 400, 'Invalid cradantials');

}