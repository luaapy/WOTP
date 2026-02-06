const express = require('express');
const router = express.Router();
const healthService = require('../../services/HealthService');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health and monitoring
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System health status
 */
router.get('/', async (req, res) => {
    try {
        const health = await healthService.getHealthStatus();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/v1/health/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System metrics
 */
router.get('/metrics', async (req, res) => {
    try {
        const metrics = healthService.getMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
