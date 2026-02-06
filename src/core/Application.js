/**
 * Core Application Class
 * Manages application lifecycle and dependency injection
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class Application extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
        this.isInitialized = false;
        this.isShuttingDown = false;
    }

    /**
     * Register a service
     * @param {string} name - Service name
     * @param {Object} service - Service instance
     */
    register(name, service) {
        if (this.services.has(name)) {
            throw new Error(`Service "${name}" is already registered`);
        }

        this.services.set(name, service);
        logger.debug({ service: name }, 'Service registered');
        this.emit('service:registered', name, service);
    }

    /**
     * Get a registered service
     * @param {string} name - Service name
     * @returns {Object} Service instance
     */
    get(name) {
        if (!this.services.has(name)) {
            throw new Error(`Service "${name}" is not registered`);
        }
        return this.services.get(name);
    }

    /**
     * Check if service exists
     * @param {string} name - Service name
     * @returns {boolean}
     */
    has(name) {
        return this.services.has(name);
    }

    /**
     * Initialize all services
     */
    async initialize() {
        if (this.isInitialized) {
            logger.warn('Application already initialized');
            return;
        }

        logger.info('Initializing application services...');

        for (const [name, service] of this.services) {
            if (typeof service.init === 'function') {
                try {
                    await service.init();
                    logger.debug({ service: name }, 'Service initialized');
                } catch (error) {
                    logger.error({ err: error, service: name }, 'Failed to initialize service');
                    throw error;
                }
            }
        }

        this.isInitialized = true;
        this.emit('initialized');
        logger.info('Application initialized successfully');
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        if (this.isShuttingDown) {
            logger.warn('Shutdown already in progress');
            return;
        }

        this.isShuttingDown = true;
        logger.info('Starting graceful shutdown...');

        // Shutdown services in reverse order
        const services = Array.from(this.services.entries()).reverse();

        for (const [name, service] of services) {
            if (typeof service.shutdown === 'function') {
                try {
                    await service.shutdown();
                    logger.debug({ service: name }, 'Service shut down');
                } catch (error) {
                    logger.error({ err: error, service: name }, 'Error shutting down service');
                }
            }
        }

        this.emit('shutdown');
        logger.info('Application shutdown complete');
    }

    /**
     * Get all registered services
     * @returns {Map}
     */
    getServices() {
        return new Map(this.services);
    }

    /**
     * Clear all services (for testing)
     */
    clear() {
        this.services.clear();
        this.isInitialized = false;
        this.isShuttingDown = false;
    }
}

// Export singleton instance
module.exports = new Application();
