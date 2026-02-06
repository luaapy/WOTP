/**
 * Template Model
 * Represents a message template
 */

const BaseModel = require('./BaseModel');

class Template extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.code = data.code || '';
        this.name = data.name || '';
        this.content = data.content || '';
        this.language = data.language || 'en';
        this.variables = data.variables || [];
        this.userId = data.userId || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.usageCount = data.usageCount || 0;
        this.category = data.category || 'general';
        this.metadata = data.metadata || {};
    }

    /**
     * Render template with variables
     * @param {Object} variables - Variable values
     * @returns {string}
     */
    render(variables = {}) {
        let rendered = this.content;

        // Replace all variables
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, variables[key]);
        });

        return rendered;
    }

    /**
     * Extract variables from content
     * @returns {string[]}
     */
    extractVariables() {
        const regex = /{{(\w+)}}/g;
        const matches = [];
        let match;

        while ((match = regex.exec(this.content)) !== null) {
            if (!matches.includes(match[1])) {
                matches.push(match[1]);
            }
        }

        return matches;
    }

    /**
     * Validate template variables
     * @param {Object} variables - Variables to validate
     * @returns {Object}
     */
    validateVariables(variables = {}) {
        const errors = [];
        const required = this.extractVariables();

        required.forEach(varName => {
            if (!(varName in variables)) {
                errors.push(`Missing required variable: ${varName}`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
            required
        };
    }

    /**
     * Increment usage count
     */
    incrementUsage() {
        this.usageCount++;
        this.touch();
    }

    /**
     * Activate template
     */
    activate() {
        this.isActive = true;
        this.touch();
    }

    /**
     * Deactivate template
     */
    deactivate() {
        this.isActive = false;
        this.touch();
    }

    /**
     * Validate template data
     * @returns {Object}
     */
    validate() {
        const errors = [];

        if (!this.code || this.code.length < 3) {
            errors.push('Code must be at least 3 characters');
        }

        if (!/^[a-z0-9_]+$/.test(this.code)) {
            errors.push('Code must contain only lowercase letters, numbers, and underscores');
        }

        if (!this.name || this.name.length < 3) {
            errors.push('Name must be at least 3 characters');
        }

        if (!this.content || this.content.length < 10) {
            errors.push('Content must be at least 10 characters');
        }

        const validLanguages = ['en', 'id', 'es', 'fr', 'de', 'pt', 'ja', 'zh'];
        if (!validLanguages.includes(this.language)) {
            errors.push(`Language must be one of: ${validLanguages.join(', ')}`);
        }

        // Check if declared variables match extracted ones
        const extracted = this.extractVariables();
        const declared = this.variables;

        const missing = extracted.filter(v => !declared.includes(v));
        if (missing.length > 0) {
            errors.push(`Variables in content but not declared: ${missing.join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get preview with sample data
     * @returns {string}
     */
    getPreview() {
        const sampleData = {};
        this.variables.forEach(varName => {
            sampleData[varName] = `[${varName}]`;
        });
        return this.render(sampleData);
    }
}

module.exports = Template;
