const Joi = require('joi');

const bulkSendSchema = Joi.object({
    recipients: Joi.array().items(
        Joi.object({
            phone: Joi.string().required().pattern(/^[0-9]{10,15}$/),
            code: Joi.string(),
            name: Joi.string(),
            // Allow any additional custom fields
        }).unknown(true)
    ).required().min(1).max(1000),
    template: Joi.string().required().min(10).max(1000),
    metadata: Joi.object().unknown(true)
});

module.exports = {
    bulkSendSchema
};
