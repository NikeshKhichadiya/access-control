import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import { sendResponse } from "../../helpers/sendResponse";
import { User } from "../../models/user";
import { UserState } from "./user.model";
import { userValidation } from "./user.validation";

let dataPicker = (data: any): UserState => {

    return _.pick(data, ['email', 'password'])

}

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    let data: UserState = dataPicker(req.body);

    let { error } = await userValidation(data);
    if (error) throw error;

    const user = await User.findOne({ email: req.body.email });
    if (!!user) { return sendResponse(res, 400, 'User already exist') }

    await new User(data).save();
    sendResponse(res, 200, 'User registered successfully');

}