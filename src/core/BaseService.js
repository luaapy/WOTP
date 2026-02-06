/**
 * Base Service Class
 * Abstract base class for all services
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class BaseService extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.status = 'idle';
        this.startedAt = null;
        this.stoppedAt = null;
    }

    /**
     * Initialize the service
     * Override this method in child classes
     */
    async init() {
        logger.debug({ service: this.name }, 'Initializing service...');
        this.status = 'initializing';

        try {
            await this.onInit();
            this.status = 'initialized';
            this.emit('initialized');
            logger.info({ service: this.name }, 'Service initialized');
        } catch (error) {
            this.status = 'failed';
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Start the service
     */
    async start() {
        if (this.status === 'running') {
            logger.warn({ service: this.name }, 'Service already running');
            return;
        }

        logger.debug({ service: this.name }, 'Starting service...');
        this.status = 'starting';

        try {
            await this.onStart();
            this.status = 'running';
            this.startedAt = new Date();
            this.emit('started');
            logger.info({ service: this.name }, 'Service started');
        } catch (error) {
            this.status = 'failed';
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Stop the service
     */
    async stop() {
        if (this.status !== 'running') {
            logger.warn({ service: this.name }, 'Service not running');
            return;
        }

        logger.debug({ service: this.name }, 'Stopping service...');
        this.status = 'stopping';

        try {
            await this.onStop();
            this.status = 'stopped';
            this.stoppedAt = new Date();
            this.emit('stopped');
            logger.info({ service: this.name }, 'Service stopped');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Restart the service
     */
    async restart() {
        logger.info({ service: this.name }, 'Restarting service...');
        await this.stop();
        await this.start();
    }

    /**
     * Get service health status
     * @returns {Object}
     */
    getHealth() {
        return {
            name: this.name,
            status: this.status,
            uptime: this.getUptime(),
            startedAt: this.startedAt,
            stoppedAt: this.stoppedAt
        };
    }

    /**
     * Get service uptime in milliseconds
     * @returns {number|null}
     */
    getUptime() {
        if (!this.startedAt || this.status !== 'running') {
            return null;
        }
        return Date.now() - this.startedAt.getTime();
    }

    /**
     * Check if service is running
     * @returns {boolean}
     */
    isRunning() {
        return this.status === 'running';
    }

    /**
     * Hook: Called during initialization
     * Override in child classes
     */
    async onInit() {
        // Override in child classes
    }

    /**
     * Hook: Called during start
     * Override in child classes
     */
    async onStart() {
        // Override in child classes
    }

    /**
     * Hook: Called during stop
     * Override in child classes
     */
    async onStop() {
        // Override in child classes
    }
}

module.exports = BaseService;
