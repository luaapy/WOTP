/**
 * API Key Model
 * Represents an API key for authentication
 */

const BaseModel = require('./BaseModel');
const crypto = require('crypto');

class ApiKey extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.key = data.key || this.generateApiKey();
        this.name = data.name || 'Unnamed Key';
        this.userId = data.userId || 'default_user';
        this.permissions = data.permissions || ['otp:send', 'otp:verify'];
        this.rateLimit = data.rateLimit || 100;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.lastUsed = data.lastUsed || null;
        this.usageCount = data.usageCount || 0;
        this.expiresAt = data.expiresAt || null;
        this.metadata = data.metadata || {};
    }

    /**
     * Generate API key
     * @returns {string}
     */
    generateApiKey() {
        return `wotp_${crypto.randomBytes(32).toString('hex')}`;
    }

    /**
     * Check if key is active
     * @returns {boolean}
     */
    isKeyActive() {
        if (!this.isActive) return false;
        if (this.expiresAt && new Date() > new Date(this.expiresAt)) return false;
        return true;
    }

    /**
     * Check if key is expired
     * @returns {boolean}
     */
    isExpired() {
        return this.expiresAt && new Date() > new Date(this.expiresAt);
    }

    /**
     * Increment usage count
     */
    incrementUsage() {
        this.usageCount++;
        this.lastUsed = new Date().toISOString();
        this.touch();
    }

    /**
     * Revoke the key
     */
    revoke() {
        this.isActive = false;
        this.touch();
    }

    /**
     * Check if has permission
     * @param {string} permission
     * @returns {boolean}
     */
    hasPermission(permission) {
        return this.permissions.includes(permission) || this.permissions.includes('*');
    }

    /**
     * Add permission
     * @param {string} permission
     */
    addPermission(permission) {
        if (!this.permissions.includes(permission)) {
            this.permissions.push(permission);
            this.touch();
        }
    }

    /**
     * Remove permission
     * @param {string} permission
     */
    removePermission(permission) {
        this.permissions = this.permissions.filter(p => p !== permission);
        this.touch();
    }

    /**
     * Validate API key data
     * @returns {Object}
     */
    validate() {
        const errors = [];

        if (!this.key || !this.key.startsWith('wotp_')) {
            errors.push('Invalid API key format');
        }

        if (!this.name || this.name.length < 3) {
            errors.push('Name must be at least 3 characters');
        }

        if (!this.userId) {
            errors.push('User ID is required');
        }

        if (!Array.isArray(this.permissions) || this.permissions.length === 0) {
            errors.push('At least one permission is required');
        }

        if (typeof this.rateLimit !== 'number' || this.rateLimit < 1) {
            errors.push('Rate limit must be a positive number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Convert to safe object (hide full key)
     * @returns {Object}
     */
    toSafeJSON() {
        const data = this.toJSON();
        // Only show last 8 characters
        data.keyPreview = `wotp_...${this.key.slice(-8)}`;
        delete data.key;
        return data;
    }

    /**
     * Get days until expiry
     * @returns {number|null}
     */
    getDaysUntilExpiry() {
        if (!this.expiresAt) return null;
        const now = new Date();
        const expiry = new Date(this.expiresAt);
        return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    }
}

module.exports = ApiKey;
