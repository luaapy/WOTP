const Joi = require('joi');

const sendOTPSchema = Joi.object({
    phone: Joi.string().min(10).max(15).required().messages({
        'string.empty': 'Nomor telepon tidak boleh kosong',
        'any.required': 'Nomor telepon wajib diisi'
    }),
    message: Joi.string().min(5).required(),
    code: Joi.string().alphanum().min(4).max(8).optional(),
    expiryMinutes: Joi.number().integer().min(1).max(60).default(5)
});

const verifyOTPSchema = Joi.object({
    phone: Joi.string().required(),
    code: Joi.string().required()
});

module.exports = {
    sendOTPSchema,
    verifyOTPSchema
};
