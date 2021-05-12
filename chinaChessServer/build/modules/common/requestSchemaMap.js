"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
exports.LoginMap = Joi.object().keys({
    act: Joi.string().trim().required(),
    pwd: Joi.string().trim().required(),
});
exports.RegisterMap = Joi.object().keys({
    act: Joi.string().trim().required(),
    pwd: Joi.string().trim().required(),
});
/**
 * 校验数据结构
 * @param data
 * @param schema
 */
function checkObjectData(data, schema) {
    let bindRet = Joi.validate(data, schema, { allowUnknown: true, stripUnknown: { arrays: false, objects: true } });
    let detail = null;
    if (bindRet.error) {
        detail = bindRet.error.details.map(d => d.message);
    }
    return Object.assign(Object.assign({}, bindRet), { error: detail });
}
exports.checkObjectData = checkObjectData;
