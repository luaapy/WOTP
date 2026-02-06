const express = require('express');
const router = express.Router();
const bulkController = require('../../controllers/bulkController');
const { requireToken } = require('../../middleware/auth');
const validate = require('../../middleware/validator');
const { bulkSendSchema } = require('../../validations/bulk.validation');

/**
 * @swagger
 * tags:
 *   name: Bulk Operations
 *   description: Bulk OTP sending operations
 */

/**
 * @swagger
 * /api/v1/bulk/send:
 *   post:
 *     summary: Send OTPs to multiple recipients
 *     tags: [Bulk Operations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - template
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                 example:
 *                   - phone: "6283834946034"
 *                     code: "1234"
 *                     name: "John"
 *                   - phone: "6281234567890"
 *                     code: "5678"
 *                     name: "Jane"
 *               template:
 *                 type: string
 *                 example: "Hello {{name}}, your code is {{code}}"
 *     responses:
 *       202:
 *         description: Bulk operation started
 */
router.post('/send', requireToken, validate(bulkSendSchema), bulkController.sendBulk);

/**
 * @swagger
 * /api/v1/bulk/status/{bulkId}:
 *   get:
 *     summary: Get bulk operation status
 *     tags: [Bulk Operations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bulkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bulk operation status
 */
router.get('/status/:bulkId', requireToken, bulkController.getBulkStatus);

module.exports = router;
