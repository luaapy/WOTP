const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./db/wodb');
const whatsapp = require('./services/whatsapp');
const rateLimiter = require('./services/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Versioned Routes
const v1OTPRoutes = require('./api/v1/otp.routes.js');
const v1AnalyticsRoutes = require('./api/v1/analytics.routes.js');
const v1TemplatesRoutes = require('./api/v1/templates.routes.js');
const v1BulkRoutes = require('./api/v1/bulk.routes.js');
const v1SchedulerRoutes = require('./api/v1/scheduler.routes.js');
const v1HealthRoutes = require('./api/v1/health.routes.js');
const v1KeysRoutes = require('./api/v1/keys.routes.js');
const adminRoutes = require('./routes/admin');

// Services
const schedulerService = require('./services/SchedulerService');

const app = express();

// 1. Swagger Setup (Pro-Docs)
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'WOTP Enterprise Platform',
            version: '3.0.0',
            description: 'The Unified WhatsApp Gateway API Docs. Explore and test our endpoints.',
            contact: {
                name: "Platform Support",
                email: "admin@wotp-gateway.pro"
            }
        },
        servers: [{ url: `http://localhost:${config.port}`, description: 'Local Server' }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ BearerAuth: [] }]
    },
    apis: ['./src/api/v1/*.js', './src/routes/*.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 2. Global Middleware
app.use(express.json());
app.use(express.static('public'));

// API Documentation UI Customization
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "WOTP API Explorer"
}));

// 5. Versioned API Routes
app.use('/api/v1/otp', v1OTPRoutes);
app.use('/api/v1/analytics', v1AnalyticsRoutes);
app.use('/api/v1/templates', v1TemplatesRoutes);
app.use('/api/v1/bulk', v1BulkRoutes);
app.use('/api/v1/scheduler', v1SchedulerRoutes);
app.use('/api/v1/health', v1HealthRoutes);
app.use('/api/v1/keys', v1KeysRoutes);
app.use('/api/admin', adminRoutes);

// 6. Global 404
app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint not found' }));

// 7. Powerful Global Error Handler (Must be last)
app.use(errorHandler);

async function bootstrap() {
    try {
        await db.init();
        await rateLimiter.init();

        // Start WhatsApp background service
        whatsapp.init().catch(err => logger.error({ err }, 'WhatsApp engine failure'));

        // Initialize scheduler service
        await schedulerService.init();

        app.listen(config.port, () => {
            logger.info({
                port: config.port,
                docs: `http://localhost:${config.port}/docs`,
                v1: `http://localhost:${config.port}/api/v1/otp`,
                analytics: `http://localhost:${config.port}/api/v1/analytics`,
                health: `http://localhost:${config.port}/api/v1/health`
            }, '🚀 Enterprise Gateway Platform Ready');
        });
    } catch (error) {
        logger.fatal(error, 'Platform Bootstrap Failed');
        process.exit(1);
    }
}

// OS Signal Handling
process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Promise Rejection');
});

bootstrap();
