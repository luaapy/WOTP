/**
 * Session Store
 * Persistent storage for sessions (can be extended to use Redis, etc.)
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class SessionStore {
    constructor(options = {}) {
        this.storePath = options.storePath || path.join(process.cwd(), 'data', 'sessions.json');
        this.autoSave = options.autoSave !== false;
        this.saveInterval = options.saveInterval || 5 * 60 * 1000; // 5 minutes
        this.saveTimer = null;
        this.sessions = new Map();
    }

    /**
     * Initialize store
     */
    async init() {
        await this.load();

        if (this.autoSave) {
            this.startAutoSave();
        }

        logger.info({ storePath: this.storePath }, 'Session store initialized');
    }

    /**
     * Load sessions from disk
     */
    async load() {
        try {
            const data = await fs.readFile(this.storePath, 'utf8');
            const sessions = JSON.parse(data);

            this.sessions = new Map(Object.entries(sessions));

            logger.info({ count: this.sessions.size }, 'Sessions loaded from disk');
        } catch (error) {
            if (error.code === 'ENOENT') {
                logger.info('No existing session file found, starting fresh');
            } else {
                logger.error({ err: error }, 'Error loading sessions');
            }
        }
    }

    /**
     * Save sessions to disk
     */
    async save() {
        try {
            // Ensure directory exists
            await fs.mkdir(path.dirname(this.storePath), { recursive: true });

            const sessions = Object.fromEntries(this.sessions);
            await fs.writeFile(this.storePath, JSON.stringify(sessions, null, 2));

            logger.debug({ count: this.sessions.size }, 'Sessions saved to disk');
        } catch (error) {
            logger.error({ err: error }, 'Error saving sessions');
        }
    }

    /**
     * Start auto-save timer
     */
    startAutoSave() {
        this.saveTimer = setInterval(() => {
            this.save().catch(err => {
                logger.error({ err }, 'Auto-save failed');
            });
        }, this.saveInterval);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }

    /**
     * Set session
     * @param {string} sessionId
     * @param {Object} session
     */
    set(sessionId, session) {
        this.sessions.set(sessionId, session);
    }

    /**
     * Get session
     * @param {string} sessionId
     * @returns {Object|null}
     */
    get(sessionId) {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * Delete session
     * @param {string} sessionId
     * @returns {boolean}
     */
    delete(sessionId) {
        return this.sessions.delete(sessionId);
    }

    /**
     * Check if session exists
     * @param {string} sessionId
     * @returns {boolean}
     */
    has(sessionId) {
        return this.sessions.has(sessionId);
    }

    /**
     * Get all sessions
     * @returns {Map}
     */
    getAll() {
        return new Map(this.sessions);
    }

    /**
     * Clear all sessions
     */
    clear() {
        this.sessions.clear();
    }

    /**
     * Get session count
     * @returns {number}
     */
    size() {
        return this.sessions.size;
    }

    /**
     * Shutdown store
     */
    async shutdown() {
        this.stopAutoSave();
        await this.save();
        logger.info('Session store shutdown');
    }
}

module.exports = SessionStore;
