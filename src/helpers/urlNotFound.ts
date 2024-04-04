import { NextFunction, Request, Response } from "express";
import { sendResponse } from "./sendResponse";

export const urlNotFound = (req: Request, res: Response, next: NextFunction) => {

    sendResponse(res, 404, 'Url Not Found');

}