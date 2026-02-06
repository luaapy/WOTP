/**
 * Global Event Bus
 * Centralized event management for application-wide events
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Increase max listeners for large apps
        this.eventLog = [];
        this.maxLogSize = 1000;
    }

    /**
     * Emit an event with logging
     * @param {string} event - Event name
     * @param {...*} args - Event arguments
     */
    publish(event, ...args) {
        this.logEvent(event, args);

        logger.debug({ event, argsCount: args.length }, 'Event published');

        return this.emit(event, ...args);
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    subscribe(event, handler) {
        logger.debug({ event }, 'Event subscription added');
        return this.on(event, handler);
    }

    /**
     * Subscribe once to an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    subscribeOnce(event, handler) {
        logger.debug({ event }, 'One-time event subscription added');
        return this.once(event, handler);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    unsubscribe(event, handler) {
        logger.debug({ event }, 'Event subscription removed');
        return this.off(event, handler);
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    unsubscribeAll(event) {
        logger.debug({ event }, 'All subscriptions removed for event');
        return this.removeAllListeners(event);
    }

    /**
     * Log event for debugging
     * @param {string} event - Event name
     * @param {Array} args - Event arguments
     */
    logEvent(event, args) {
        const logEntry = {
            event,
            timestamp: new Date().toISOString(),
            argsCount: args.length
        };

        this.eventLog.push(logEntry);

        // Keep log size manageable
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog.shift();
        }
    }

    /**
     * Get event log
     * @param {number} limit - Number of recent events to return
     * @returns {Array}
     */
    getEventLog(limit = 100) {
        return this.eventLog.slice(-limit);
    }

    /**
     * Clear event log
     */
    clearEventLog() {
        this.eventLog = [];
    }

    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number}
     */
    getListenerCount(event) {
        return this.listenerCount(event);
    }

    /**
     * Get all event names
     * @returns {string[]}
     */
    getEventNames() {
        return this.eventNames();
    }
}

// Export singleton instance
module.exports = new EventBus();
