/**
 * OTP Model
 * Represents an OTP code
 */

const BaseModel = require('./BaseModel');

class OTP extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.phone = data.phone || '';
        this.code = data.code || '';
        this.message = data.message || '';
        this.expiresAt = data.expiresAt || this.calculateExpiry(data.expiryMinutes || 5);
        this.verified = data.verified || false;
        this.verifiedAt = data.verifiedAt || null;
        this.attempts = data.attempts || 0;
        this.maxAttempts = data.maxAttempts || 3;
        this.userId = data.userId || null;
        this.metadata = data.metadata || {};
    }

    /**
     * Calculate expiry time
     * @param {number} minutes
     * @returns {string}
     */
    calculateExpiry(minutes) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + minutes);
        return expiry.toISOString();
    }

    /**
     * Check if OTP is expired
     * @returns {boolean}
     */
    isExpired() {
        return new Date() > new Date(this.expiresAt);
    }

    /**
     * Check if OTP is verified
     * @returns {boolean}
     */
    isVerified() {
        return this.verified === true;
    }

    /**
     * Check if max attempts reached
     * @returns {boolean}
     */
    isMaxAttemptsReached() {
        return this.attempts >= this.maxAttempts;
    }

    /**
     * Increment attempt counter
     */
    incrementAttempts() {
        this.attempts++;
        this.touch();
    }

    /**
     * Mark as verified
     */
    markAsVerified() {
        this.verified = true;
        this.verifiedAt = new Date().toISOString();
        this.touch();
    }

    /**
     * Validate OTP data
     * @returns {Object}
     */
    validate() {
        const errors = [];

        if (!this.phone || this.phone.length < 10) {
            errors.push('Invalid phone number');
        }

        if (!this.code || this.code.length < 4) {
            errors.push('Invalid OTP code');
        }

        if (!this.message) {
            errors.push('Message is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get time until expiry in seconds
     * @returns {number}
     */
    getTimeUntilExpiry() {
        const now = new Date();
        const expiry = new Date(this.expiresAt);
        return Math.max(0, Math.floor((expiry - now) / 1000));
    }

    /**
     * Convert to safe object (hide sensitive data)
     * @returns {Object}
     */
    toSafeJSON() {
        const data = this.toJSON();
        // Don't expose the actual code in API responses
        delete data.code;
        return data;
    }
}

module.exports = OTP;
