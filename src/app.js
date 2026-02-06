/**
 * Application Bootstrap
 * Initializes all services and starts the server
 */

const express = require('express');
const logger = require('./utils/logger');
const config = require('./config');
const db = require('./database');
const whatsapp = require('./bot');
const apiServer = require('./api/server');

class Application {
    constructor() {
        this.app = express();
        this.server = null;
    }

    async start() {
        try {
            logger.info('🚀 Starting WOTP Enterprise Platform...');

            // Initialize database
            await this.initializeDatabase();

            // Initialize WhatsApp bot
            await this.initializeBot();

            // Start API server
            await this.startApiServer();

            logger.info({
                port: config.api.port,
                env: config.env,
                docs: `http://localhost:${config.api.port}/docs`,
                health: `http://localhost:${config.api.port}/api/v1/health`
            }, '✅ WOTP Enterprise Platform Ready');

        } catch (error) {
            logger.fatal({ err: error }, 'Failed to start application');
            throw error;
        }
    }

    async initializeDatabase() {
        logger.info('📦 Initializing database...');
        await db.init();
        logger.info('✅ Database initialized');
    }

    async initializeBot() {
        logger.info('🤖 Initializing WhatsApp bot...');
        await whatsapp.init();
        logger.info('✅ WhatsApp bot initialized');
    }

    async startApiServer() {
        logger.info('🌐 Starting API server...');
        this.server = await apiServer.start();
        logger.info(`✅ API server started on port ${config.api.port}`);
    }

    async stop() {
        logger.info('Shutting down application...');

        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }

        await db.close();
        await whatsapp.disconnect();

        logger.info('Application shutdown complete');
    }
}

// Export singleton instance
const app = new Application();
module.exports = app;
