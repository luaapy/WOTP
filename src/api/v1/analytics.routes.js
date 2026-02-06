const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analyticsController');
const { requireToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get analytics dashboard data
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to include in stats
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 */
router.get('/dashboard', requireToken, analyticsController.getDashboard);

/**
 * @swagger
 * /api/v1/analytics/success-rate:
 *   get:
 *     summary: Get OTP success rate
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Success rate statistics
 */
router.get('/success-rate', requireToken, analyticsController.getSuccessRate);

/**
 * @swagger
 * /api/v1/analytics/delivery-time:
 *   get:
 *     summary: Get average delivery time
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Average delivery time in seconds
 */
router.get('/delivery-time', requireToken, analyticsController.getDeliveryTime);

/**
 * @swagger
 * /api/v1/analytics/top-phones:
 *   get:
 *     summary: Get most frequently used phone numbers
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top phone numbers by usage
 */
router.get('/top-phones', requireToken, analyticsController.getTopPhones);

module.exports = router;
