/**
 * Service Manager
 * Manages service lifecycle and dependencies
 */

const logger = require('../utils/logger');
const EventBus = require('./EventBus');

class ServiceManager {
    constructor() {
        this.services = new Map();
        this.startOrder = [];
        this.dependencies = new Map();
    }

    /**
     * Register a service
     * @param {string} name - Service name
     * @param {Object} service - Service instance
     * @param {string[]} dependencies - Service dependencies
     */
    register(name, service, dependencies = []) {
        if (this.services.has(name)) {
            throw new Error(`Service "${name}" is already registered`);
        }

        this.services.set(name, {
            instance: service,
            status: 'registered',
            dependencies,
            startedAt: null,
            stoppedAt: null
        });

        this.dependencies.set(name, dependencies);

        logger.info({ service: name, dependencies }, 'Service registered');
        EventBus.publish('service:registered', { name, dependencies });
    }

    /**
     * Start a service and its dependencies
     * @param {string} name - Service name
     */
    async start(name) {
        const serviceData = this.services.get(name);

        if (!serviceData) {
            throw new Error(`Service "${name}" not found`);
        }

        if (serviceData.status === 'started') {
            logger.debug({ service: name }, 'Service already started');
            return;
        }

        // Start dependencies first
        for (const dep of serviceData.dependencies) {
            await this.start(dep);
        }

        // Start the service
        try {
            logger.info({ service: name }, 'Starting service...');

            if (typeof serviceData.instance.start === 'function') {
                await serviceData.instance.start();
            } else if (typeof serviceData.instance.init === 'function') {
                await serviceData.instance.init();
            }

            serviceData.status = 'started';
            serviceData.startedAt = new Date();
            this.startOrder.push(name);

            logger.info({ service: name }, 'Service started');
            EventBus.publish('service:started', { name });

        } catch (error) {
            serviceData.status = 'failed';
            logger.error({ err: error, service: name }, 'Failed to start service');
            EventBus.publish('service:failed', { name, error });
            throw error;
        }
    }

    /**
     * Start all services
     */
    async startAll() {
        logger.info('Starting all services...');

        const sorted = this.topologicalSort();

        for (const name of sorted) {
            await this.start(name);
        }

        logger.info('All services started');
    }

    /**
     * Stop a service
     * @param {string} name - Service name
     */
    async stop(name) {
        const serviceData = this.services.get(name);

        if (!serviceData) {
            throw new Error(`Service "${name}" not found`);
        }

        if (serviceData.status !== 'started') {
            logger.debug({ service: name }, 'Service not started');
            return;
        }

        try {
            logger.info({ service: name }, 'Stopping service...');

            if (typeof serviceData.instance.stop === 'function') {
                await serviceData.instance.stop();
            } else if (typeof serviceData.instance.shutdown === 'function') {
                await serviceData.instance.shutdown();
            }

            serviceData.status = 'stopped';
            serviceData.stoppedAt = new Date();

            logger.info({ service: name }, 'Service stopped');
            EventBus.publish('service:stopped', { name });

        } catch (error) {
            logger.error({ err: error, service: name }, 'Error stopping service');
            EventBus.publish('service:error', { name, error });
            throw error;
        }
    }

    /**
     * Stop all services in reverse order
     */
    async stopAll() {
        logger.info('Stopping all services...');

        // Stop in reverse order
        const reversed = [...this.startOrder].reverse();

        for (const name of reversed) {
            await this.stop(name);
        }

        this.startOrder = [];
        logger.info('All services stopped');
    }

    /**
     * Get service instance
     * @param {string} name - Service name
     * @returns {Object}
     */
    get(name) {
        const serviceData = this.services.get(name);

        if (!serviceData) {
            throw new Error(`Service "${name}" not found`);
        }

        return serviceData.instance;
    }

    /**
     * Get service status
     * @param {string} name - Service name
     * @returns {Object}
     */
    getStatus(name) {
        const serviceData = this.services.get(name);

        if (!serviceData) {
            return null;
        }

        return {
            name,
            status: serviceData.status,
            dependencies: serviceData.dependencies,
            startedAt: serviceData.startedAt,
            stoppedAt: serviceData.stoppedAt,
            uptime: serviceData.startedAt
                ? Date.now() - serviceData.startedAt.getTime()
                : null
        };
    }

    /**
     * Get all services status
     * @returns {Object[]}
     */
    getAllStatus() {
        const statuses = [];

        for (const name of this.services.keys()) {
            statuses.push(this.getStatus(name));
        }

        return statuses;
    }

    /**
     * Topological sort for dependency resolution
     * @returns {string[]}
     */
    topologicalSort() {
        const visited = new Set();
        const result = [];

        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);

            const deps = this.dependencies.get(name) || [];
            for (const dep of deps) {
                visit(dep);
            }

            result.push(name);
        };

        for (const name of this.services.keys()) {
            visit(name);
        }

        return result;
    }
}

// Export singleton instance
module.exports = new ServiceManager();
