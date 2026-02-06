/**
 * Audit Log Model
 * Represents an audit log entry
 */

const BaseModel = require('./BaseModel');

class AuditLog extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.userId = data.userId || null;
        this.apiKey = data.apiKey || null;
        this.action = data.action || '';
        this.resource = data.resource || '';
        this.resourceId = data.resourceId || null;
        this.details = data.details || {};
        this.ipAddress = data.ipAddress || null;
        this.userAgent = data.userAgent || null;
        this.status = data.status || 'success';
        this.errorMessage = data.errorMessage || null;
        this.duration = data.duration || null;
        this.metadata = data.metadata || {};
    }

    /**
     * Check if action was successful
     * @returns {boolean}
     */
    isSuccess() {
        return this.status === 'success';
    }

    /**
     * Check if action failed
     * @returns {boolean}
     */
    isFailed() {
        return this.status === 'failed' || this.status === 'error';
    }

    /**
     * Mark as failed
     * @param {string} errorMessage
     */
    markAsFailed(errorMessage) {
        this.status = 'failed';
        this.errorMessage = errorMessage;
        this.touch();
    }

    /**
     * Set duration
     * @param {number} milliseconds
     */
    setDuration(milliseconds) {
        this.duration = milliseconds;
        this.touch();
    }

    /**
     * Validate audit log data
     * @returns {Object}
     */
    validate() {
        const errors = [];

        if (!this.action) {
            errors.push('Action is required');
        }

        if (!this.resource) {
            errors.push('Resource is required');
        }

        const validStatuses = ['success', 'failed', 'error', 'pending'];
        if (!validStatuses.includes(this.status)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get formatted log entry
     * @returns {string}
     */
    getFormattedEntry() {
        const timestamp = new Date(this.createdAt).toISOString();
        const user = this.userId || 'anonymous';
        const status = this.status.toUpperCase();

        return `[${timestamp}] ${status} - User: ${user} - Action: ${this.action} - Resource: ${this.resource}`;
    }

    /**
     * Check if contains sensitive data
     * @returns {boolean}
     */
    hasSensitiveData() {
        const sensitiveActions = ['login', 'password_change', 'api_key_create'];
        return sensitiveActions.includes(this.action);
    }

    /**
     * Convert to safe object (hide sensitive data)
     * @returns {Object}
     */
    toSafeJSON() {
        const data = this.toJSON();

        // Remove potentially sensitive details
        if (this.hasSensitiveData()) {
            data.details = { redacted: true };
        }

        return data;
    }
}

module.exports = AuditLog;
