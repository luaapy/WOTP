const Joi = require('joi');

const createTemplateSchema = Joi.object({
    code: Joi.string().required().min(3).max(50).pattern(/^[a-z0-9_]+$/),
    name: Joi.string().required().min(3).max(100),
    content: Joi.string().required().min(10).max(1000),
    language: Joi.string().valid('en', 'id', 'es', 'fr', 'de').default('en'),
    variables: Joi.array().items(Joi.string()).default(['code', 'expiry'])
});

const updateTemplateSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    content: Joi.string().min(10).max(1000),
    language: Joi.string().valid('en', 'id', 'es', 'fr', 'de'),
    variables: Joi.array().items(Joi.string()),
    isActive: Joi.boolean()
}).min(1);

module.exports = {
    createTemplateSchema,
    updateTemplateSchema
};
