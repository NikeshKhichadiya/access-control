import { Request, Response } from 'express';
import { FileAccessState } from './fileAccess.model';
import _ from 'lodash';
import { fileAccessValidation, removeFileValidation } from './fileAcess.validation';
import { FileAccess } from '../../models/fileAccess';
import { sendResponse } from '../../helpers/sendResponse';
import { User } from '../../models/user';
import { File } from '../../models/file';

const dataPicker = (data: any, keys?: string[]): FileAccessState => {

    return _.pick(data, Array.isArray(keys) && keys?.length > 0 ? keys : ['user_id', 'file_id', 'access_type'])

}

export const giveFileAccess = async (req: Request, res: Response): Promise<void> => {

    let data: FileAccessState = dataPicker(req.body);

    let { error } = await fileAccessValidation(data);
    if (error) throw error;

    const access = await FileAccess.findOne(data);
    if (!!access) { return sendResponse(res, 400, 'File already have access'); }

    const user = await User.findOne({ _id: data.user_id });
    if (!user) { return sendResponse(res, 400, 'User not found'); }

    const file = await File.findOne({ _id: data.file_id });
    if (!file) { return sendResponse(res, 400, 'File not found'); }

    await new FileAccess(data).save();
    sendResponse(res, 200, 'Access given successfully');

}

export const removeFileAccess = async (req: Request, res: Response): Promise<void> => {

    const data: FileAccessState = dataPicker(req.body, ['user_id', 'file_id']);
    const userId = req.headers.userId;

    const { error } = await removeFileValidation(data);
    if (error) throw error;

    const file = await File.findOne({ _id: data.file_id, user_id: userId });
    if (!file) { return sendResponse(res, 400, 'File not found or you are not the owner'); }

    await FileAccess.deleteOne({ user_id: data.user_id, file_id: data.file_id });
    sendResponse(res, 200, 'Access removed successfully');

}