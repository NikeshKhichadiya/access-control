import Joi from 'joi';

export const fileAccessValidation = async (data: any): Promise<any> => {

    return Joi.object({

        user_id: Joi.string().trim().regex(/^[0-9a-fA-F]{24}$/).required().label("User ID").messages({
            'any.required': 'User ID is required.',
            'string.pattern.base': 'User ID must be a valid MongoDB ObjectId.'
        }),
        file_id: Joi.string().trim().regex(/^[0-9a-fA-F]{24}$/).required().label("File ID").messages({
            'any.required': 'File ID is required.',
            'string.pattern.base': 'File ID must be a valid MongoDB ObjectId.'
        }),
        access_type: Joi.string().valid('read', 'write').required().label("Access Type").messages({
            'any.required': 'Access Type is required.',
            'any.only': 'Access Type must be either "read" or "write".'
        }),

    }).validate(data, { abortEarly: false });

}
