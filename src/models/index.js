/**
 * Model Exports
 * Central export point for all models
 */

module.exports = {
    BaseModel: require('./BaseModel'),
    OTP: require('./OTP'),
    ApiKey: require('./ApiKey'),
    Template: require('./Template'),
    User: require('./User'),
    AuditLog: require('./AuditLog'),
    AnalyticsEvent: require('./AnalyticsEvent')
};
