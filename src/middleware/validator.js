const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        logger.warn({ path: req.path, errors: errorMessages }, 'Validation failed');
        return res.status(400).json({
            success: false,
            errors: errorMessages
        });
    }

    // Replace body with validated/sanitized values
    req.body = value;
    next();
};

module.exports = validate;
