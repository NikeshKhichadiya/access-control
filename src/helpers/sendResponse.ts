import { Response } from "express";

export const sendResponse = (res: Response, statusCode: number, message: string, data?: any): void => {

    res.status(statusCode).send({ message, ...data })

}