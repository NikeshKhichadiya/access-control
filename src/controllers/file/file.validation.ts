import Joi from 'joi';

export const fileValidation = async (data: any): Promise<any> => {

    return Joi.object({

        file_id: Joi.string().trim().regex(/^[0-9a-fA-F]{24}$/).required().label("File ID").messages({
            'any.required': 'File ID is required.',
            'string.pattern.base': 'File ID must be a valid MongoDB ObjectId.'
        }),

    }).validate(data, { abortEarly: false });

}
