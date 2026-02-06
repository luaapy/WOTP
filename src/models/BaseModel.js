/**
 * Base Model Class
 * Provides common functionality for all models
 */

const { v4: uuidv4 } = require('uuid');

class BaseModel {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return uuidv4();
    }

    /**
     * Update timestamp
     */
    touch() {
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Convert to plain object
     * @returns {Object}
     */
    toJSON() {
        return { ...this };
    }

    /**
     * Convert to database format
     * @returns {Object}
     */
    toDatabase() {
        return this.toJSON();
    }

    /**
     * Create from database format
     * @param {Object} data - Database data
     * @returns {BaseModel}
     */
    static fromDatabase(data) {
        return new this(data);
    }

    /**
     * Validate model data
     * Override in child classes
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        return { valid: true, errors: [] };
    }

    /**
     * Check if model is valid
     * @returns {boolean}
     */
    isValid() {
        return this.validate().valid;
    }

    /**
     * Get validation errors
     * @returns {string[]}
     */
    getErrors() {
        return this.validate().errors;
    }

    /**
     * Clone the model
     * @returns {BaseModel}
     */
    clone() {
        return new this.constructor(this.toJSON());
    }

    /**
     * Compare with another model
     * @param {BaseModel} other
     * @returns {boolean}
     */
    equals(other) {
        return this.id === other.id;
    }
}

module.exports = BaseModel;
