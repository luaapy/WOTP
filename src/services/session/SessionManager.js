/**
 * Session Manager
 * Manages user sessions and authentication tokens
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');
const EventBus = require('../../core/EventBus');

class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.cleanupInterval = null;
    }

    /**
     * Initialize session manager
     */
    init() {
        // Start cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000); // Every hour

        logger.info('Session manager initialized');
    }

    /**
     * Create a new session
     * @param {string} userId - User ID
     * @param {Object} data - Session data
     * @returns {Object} Session object
     */
    createSession(userId, data = {}) {
        const sessionId = this.generateSessionId();
        const expiresAt = new Date(Date.now() + this.sessionTimeout);

        const session = {
            sessionId,
            userId,
            data,
            createdAt: new Date(),
            expiresAt,
            lastAccessed: new Date(),
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null
        };

        this.sessions.set(sessionId, session);

        logger.info({ sessionId, userId }, 'Session created');
        EventBus.publish('session:created', { sessionId, userId });

        return {
            sessionId,
            expiresAt: expiresAt.toISOString()
        };
    }

    /**
     * Get session by ID
     * @param {string} sessionId - Session ID
     * @returns {Object|null} Session object or null
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return null;
        }

        // Check if expired
        if (new Date() > session.expiresAt) {
            this.destroySession(sessionId);
            return null;
        }

        // Update last accessed
        session.lastAccessed = new Date();

        return session;
    }

    /**
     * Update session data
     * @param {string} sessionId - Session ID
     * @param {Object} data - Data to update
     * @returns {boolean} Success status
     */
    updateSession(sessionId, data) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return false;
        }

        session.data = { ...session.data, ...data };
        session.lastAccessed = new Date();

        logger.debug({ sessionId }, 'Session updated');
        EventBus.publish('session:updated', { sessionId });

        return true;
    }

    /**
     * Destroy a session
     * @param {string} sessionId - Session ID
     * @returns {boolean} Success status
     */
    destroySession(sessionId) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return false;
        }

        this.sessions.delete(sessionId);

        logger.info({ sessionId, userId: session.userId }, 'Session destroyed');
        EventBus.publish('session:destroyed', { sessionId, userId: session.userId });

        return true;
    }

    /**
     * Destroy all sessions for a user
     * @param {string} userId - User ID
     * @returns {number} Number of sessions destroyed
     */
    destroyUserSessions(userId) {
        let count = 0;

        for (const [sessionId, session] of this.sessions) {
            if (session.userId === userId) {
                this.sessions.delete(sessionId);
                count++;
            }
        }

        if (count > 0) {
            logger.info({ userId, count }, 'User sessions destroyed');
            EventBus.publish('session:user_logout', { userId, count });
        }

        return count;
    }

    /**
     * Get all sessions for a user
     * @param {string} userId - User ID
     * @returns {Array} Array of sessions
     */
    getUserSessions(userId) {
        const sessions = [];

        for (const [sessionId, session] of this.sessions) {
            if (session.userId === userId) {
                sessions.push({
                    sessionId,
                    createdAt: session.createdAt,
                    expiresAt: session.expiresAt,
                    lastAccessed: session.lastAccessed,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent
                });
            }
        }

        return sessions;
    }

    /**
     * Extend session expiry
     * @param {string} sessionId - Session ID
     * @param {number} milliseconds - Time to extend
     * @returns {boolean} Success status
     */
    extendSession(sessionId, milliseconds = null) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return false;
        }

        const extension = milliseconds || this.sessionTimeout;
        session.expiresAt = new Date(Date.now() + extension);
        session.lastAccessed = new Date();

        logger.debug({ sessionId }, 'Session extended');

        return true;
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = new Date();
        let count = 0;

        for (const [sessionId, session] of this.sessions) {
            if (now > session.expiresAt) {
                this.sessions.delete(sessionId);
                count++;
            }
        }

        if (count > 0) {
            logger.info({ count }, 'Expired sessions cleaned up');
            EventBus.publish('session:cleanup', { count });
        }
    }

    /**
     * Generate session ID
     * @returns {string}
     */
    generateSessionId() {
        return `sess_${crypto.randomBytes(32).toString('hex')}`;
    }

    /**
     * Get session count
     * @returns {number}
     */
    getSessionCount() {
        return this.sessions.size;
    }

    /**
     * Get active sessions count
     * @returns {number}
     */
    getActiveSessionCount() {
        const now = new Date();
        let count = 0;

        for (const session of this.sessions.values()) {
            if (now <= session.expiresAt) {
                count++;
            }
        }

        return count;
    }

    /**
     * Get session statistics
     * @returns {Object}
     */
    getStats() {
        const now = new Date();
        let active = 0;
        let expired = 0;

        for (const session of this.sessions.values()) {
            if (now <= session.expiresAt) {
                active++;
            } else {
                expired++;
            }
        }

        return {
            total: this.sessions.size,
            active,
            expired
        };
    }

    /**
     * Shutdown session manager
     */
    shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        logger.info('Session manager shutdown');
    }
}

// Export singleton instance
module.exports = new SessionManager();
