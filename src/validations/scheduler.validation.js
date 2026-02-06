const Joi = require('joi');

const scheduleOTPSchema = Joi.object({
    phone: Joi.string().required().pattern(/^[0-9]{10,15}$/),
    message: Joi.string().required().min(10).max(500),
    code: Joi.string().optional(),
    scheduledTime: Joi.date().iso().required().greater('now'),
    expiryMinutes: Joi.number().integer().min(1).max(60).default(5),
    maxAttempts: Joi.number().integer().min(1).max(5).default(3)
});

module.exports = {
    scheduleOTPSchema
};
