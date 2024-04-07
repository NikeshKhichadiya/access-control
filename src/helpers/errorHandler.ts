import { NextFunction, Request, Response } from "express";
import { sendResponse } from "./sendResponse";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {

    console.log(error)

    if (error && Array.isArray(error?.details) && error.details.length > 0) {

        let errors: Array<any> = error.details;
        let errorPayload: any = {};

        errors.forEach((err: any) => { errorPayload[err.path[0]] = err.message })
        sendResponse(res, 400, 'Bad request', { error: errorPayload });

    }

    else sendResponse(res, 500, 'Internal server error');


}