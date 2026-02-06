/**
 * User Model
 * Represents a user/tenant
 */

const BaseModel = require('./BaseModel');
const crypto = require('crypto');

class User extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.username = data.username || '';
        this.email = data.email || '';
        this.passwordHash = data.passwordHash || '';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.role = data.role || 'user';
        this.permissions = data.permissions || [];
        this.apiKeys = data.apiKeys || [];
        this.settings = data.settings || {};
        this.lastLogin = data.lastLogin || null;
        this.loginCount = data.loginCount || 0;
        this.metadata = data.metadata || {};
    }

    /**
     * Hash password
     * @param {string} password
     * @returns {string}
     */
    static hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Set password
     * @param {string} password
     */
    setPassword(password) {
        this.passwordHash = User.hashPassword(password);
        this.touch();
    }

    /**
     * Verify password
     * @param {string} password
     * @returns {boolean}
     */
    verifyPassword(password) {
        return this.passwordHash === User.hashPassword(password);
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin() {
        return this.role === 'admin';
    }

    /**
     * Check if has permission
     * @param {string} permission
     * @returns {boolean}
     */
    hasPermission(permission) {
        if (this.isAdmin()) return true;
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
     * Record login
     */
    recordLogin() {
        this.lastLogin = new Date().toISOString();
        this.loginCount++;
        this.touch();
    }

    /**
     * Activate user
     */
    activate() {
        this.isActive = true;
        this.touch();
    }

    /**
     * Deactivate user
     */
    deactivate() {
        this.isActive = false;
        this.touch();
    }

    /**
     * Validate user data
     * @returns {Object}
     */
    validate() {
        const errors = [];

        if (!this.username || this.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
            errors.push('Username must contain only letters, numbers, and underscores');
        }

        if (!this.email || !this.isValidEmail(this.email)) {
            errors.push('Invalid email address');
        }

        const validRoles = ['user', 'admin', 'moderator'];
        if (!validRoles.includes(this.role)) {
            errors.push(`Role must be one of: ${validRoles.join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Convert to safe object (hide sensitive data)
     * @returns {Object}
     */
    toSafeJSON() {
        const data = this.toJSON();
        delete data.passwordHash;
        return data;
    }

    /**
     * Get user statistics
     * @returns {Object}
     */
    getStats() {
        return {
            id: this.id,
            username: this.username,
            role: this.role,
            isActive: this.isActive,
            loginCount: this.loginCount,
            lastLogin: this.lastLogin,
            apiKeyCount: this.apiKeys.length,
            createdAt: this.createdAt
        };
    }
}

module.exports = User;
