/**
 * Session Middleware
 * Express middleware for session handling
 */

const SessionManager = require('./SessionManager');
const logger = require('../../utils/logger');

/**
 * Session middleware
 * Attaches session to request object
 */
const sessionMiddleware = (req, res, next) => {
    // Get session ID from header or cookie
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!sessionId) {
        req.session = null;
        return next();
    }

    // Get session
    const session = SessionManager.getSession(sessionId);

    if (!session) {
        req.session = null;
        return next();
    }

    // Attach session to request
    req.session = session;
    req.sessionId = sessionId;

    // Extend session on each request
    SessionManager.extendSession(sessionId);

    next();
};

/**
 * Require session middleware
 * Ensures user has valid session
 */
const requireSession = (req, res, next) => {
    if (!req.session) {
        return res.status(401).json({
            success: false,
            error: 'Session required'
        });
    }

    next();
};

/**
 * Create session helper
 * Helper to create session from route handlers
 */
const createSession = (userId, data = {}) => {
    return SessionManager.createSession(userId, data);
};

/**
 * Destroy session helper
 * Helper to destroy session from route handlers
 */
const destroySession = (sessionId) => {
    return SessionManager.destroySession(sessionId);
};

module.exports = {
    sessionMiddleware,
    requireSession,
    createSession,
    destroySession
};
