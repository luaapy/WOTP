/**
 * Analytics Event Model
 * Represents an analytics event
 */

const BaseModel = require('./BaseModel');

class AnalyticsEvent extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.eventType = data.eventType || '';
        this.userId = data.userId || null;
        this.phone = data.phone || null;
        this.messageId = data.messageId || null;
        this.status = data.status || 'pending';
        this.deliveryTime = data.deliveryTime || null;
        this.errorCode = data.errorCode || null;
        this.errorMessage = data.errorMessage || null;
        this.metadata = data.metadata || {};
    }

    /**
     * Mark as delivered
     * @param {number} deliveryTimeMs
     */
    markAsDelivered(deliveryTimeMs) {
        this.status = 'delivered';
        this.deliveryTime = deliveryTimeMs;
        this.touch();
    }

    /**
     * Mark as failed
     * @param {string} errorCode
     * @param {string} errorMessage
     */
    markAsFailed(errorCode, errorMessage) {
        this.status = 'failed';
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.touch();
    }

    /**
     * Check if successful
     * @returns {boolean}
     */
    isSuccessful() {
        return this.status === 'delivered' || this.status === 'read';
    }

    /**
     * Validate analytics event data
     * @returns {Object}
     */
    validate() {
        const errors = [];

        if (!this.eventType) {
            errors.push('Event type is required');
        }

        const validStatuses = ['pending', 'sent', 'delivered', 'read', 'failed', 'error'];
        if (!validStatuses.includes(this.status)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = AnalyticsEvent;
