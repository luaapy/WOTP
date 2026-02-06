const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireMasterKey } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management and token generation
 */

/**
 * @swagger
 * /api/admin/generate-token:
 *   post:
 *     summary: Generate a new API token
 *     tags: [Admin]
 *     parameters:
 *       - in: header
 *         name: x-master-key
 *         schema:
 *           type: string
 *         required: true
 *         description: Master password for admin access
 *     responses:
 *       200:
 *         description: New bearer token generated
 */
router.post('/generate-token', requireMasterKey, adminController.generateToken.bind(adminController));

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: View transaction logs
 *     tags: [Admin]
 *     parameters:
 *       - in: header
 *         name: x-master-key
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Recent audit logs
 */
router.get('/logs', requireMasterKey, adminController.getLogs.bind(adminController));

module.exports = router;
