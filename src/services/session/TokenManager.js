/**
 * Token Manager
 * Manages authentication tokens (JWT, API keys, etc.)
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');

class TokenManager {
    constructor() {
        this.tokens = new Map();
        this.tokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    /**
     * Generate token
     * @param {string} userId - User ID
     * @param {Object} payload - Token payload
     * @returns {string} Token
     */
    generateToken(userId, payload = {}) {
        const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
        const expiresAt = new Date(Date.now() + this.tokenExpiry);

        this.tokens.set(token, {
            userId,
            payload,
            createdAt: new Date(),
            expiresAt,
            lastUsed: new Date()
        });

        logger.debug({ userId }, 'Token generated');

        return token;
    }

    /**
     * Verify token
     * @param {string} token - Token to verify
     * @returns {Object|null} Token data or null
     */
    verifyToken(token) {
        const tokenData = this.tokens.get(token);

        if (!tokenData) {
            return null;
        }

        // Check expiry
        if (new Date() > tokenData.expiresAt) {
            this.revokeToken(token);
            return null;
        }

        // Update last used
        tokenData.lastUsed = new Date();

        return {
            userId: tokenData.userId,
            payload: tokenData.payload
        };
    }

    /**
     * Revoke token
     * @param {string} token - Token to revoke
     * @returns {boolean} Success status
     */
    revokeToken(token) {
        const deleted = this.tokens.delete(token);

        if (deleted) {
            logger.debug({ token: token.substring(0, 10) + '...' }, 'Token revoked');
        }

        return deleted;
    }

    /**
     * Revoke all tokens for user
     * @param {string} userId - User ID
     * @returns {number} Number of tokens revoked
     */
    revokeUserTokens(userId) {
        let count = 0;

        for (const [token, data] of this.tokens) {
            if (data.userId === userId) {
                this.tokens.delete(token);
                count++;
            }
        }

        if (count > 0) {
            logger.info({ userId, count }, 'User tokens revoked');
        }

        return count;
    }

    /**
     * Get user tokens
     * @param {string} userId - User ID
     * @returns {Array} Array of token info
     */
    getUserTokens(userId) {
        const tokens = [];

        for (const [token, data] of this.tokens) {
            if (data.userId === userId) {
                tokens.push({
                    token: token.substring(0, 10) + '...',
                    createdAt: data.createdAt,
                    expiresAt: data.expiresAt,
                    lastUsed: data.lastUsed
                });
            }
        }

        return tokens;
    }

    /**
     * Cleanup expired tokens
     */
    cleanupExpiredTokens() {
        const now = new Date();
        let count = 0;

        for (const [token, data] of this.tokens) {
            if (now > data.expiresAt) {
                this.tokens.delete(token);
                count++;
            }
        }

        if (count > 0) {
            logger.info({ count }, 'Expired tokens cleaned up');
        }

        return count;
    }

    /**
     * Get token statistics
     * @returns {Object}
     */
    getStats() {
        const now = new Date();
        let active = 0;
        let expired = 0;

        for (const data of this.tokens.values()) {
            if (now <= data.expiresAt) {
                active++;
            } else {
                expired++;
            }
        }

        return {
            total: this.tokens.size,
            active,
            expired
        };
    }
}

// Export singleton instance
module.exports = new TokenManager();
