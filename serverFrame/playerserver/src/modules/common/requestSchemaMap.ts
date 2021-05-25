import Joi = require('joi');

export const LoginMap = Joi.object().keys({
    act: Joi.string().trim().required(),
    pwd: Joi.string().trim().required(),
});


export const RegisterMap = Joi.object().keys({
    act: Joi.string().trim().required(),
    pwd: Joi.string().trim().required(),
});

/**
 * 校验数据结构
 * @param data 
 * @param schema 
 */
export function checkObjectData(data: any, schema: Joi.ObjectSchema) {
    let bindRet = Joi.validate<any>(data, schema, { allowUnknown: true, stripUnknown: { arrays: false, objects: true } });
    let detail = null;
    if (bindRet.error) {
        detail = bindRet.error.details.map(d => d.message);
    }
    return { ...bindRet, error: detail };
}



