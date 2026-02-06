/**
 * Session Module Exports
 * Central export point for session-related functionality
 */

const SessionManager = require('./SessionManager');
const SessionStore = require('./SessionStore');
const TokenManager = require('./TokenManager');
const {
    sessionMiddleware,
    requireSession,
    createSession,
    destroySession
} = require('./middleware');

module.exports = {
    // Core managers
    SessionManager,
    SessionStore,
    TokenManager,

    // Middleware
    sessionMiddleware,
    requireSession,

    // Helpers
    createSession,
    destroySession
};
