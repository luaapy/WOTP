#!/usr/bin/env node

/**
 * WOTP Enterprise Platform - Main Entry Point
 * This is the root entry point that initializes the application
 */

require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/utils/logger');
const config = require('./src/config');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught Exception');
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Promise Rejection');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the application
app.start().catch((error) => {
    logger.fatal({ err: error }, 'Failed to start application');
    process.exit(1);
});
