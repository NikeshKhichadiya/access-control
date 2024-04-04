import Joi from 'joi';

export const userValidation = async (data: any): Promise<any> => {

    return Joi.object({

        email: Joi.string().trim().email({ tlds: { allow: false } }).required().label("Email"),
        password: Joi.string().trim().min(8).max(20).required().label("Password"),

    }).validate(data, { abortEarly: false });

}