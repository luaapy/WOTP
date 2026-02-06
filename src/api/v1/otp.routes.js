const express = require('express');
const router = express.Router();
const otpController = require('../../controllers/otpController');
const { requireToken } = require('../../middleware/auth');
const validate = require('../../middleware/validator');
const { sendOTPSchema, verifyOTPSchema } = require('../../validations/otp.validation');

/**
 * @swagger
 * tags:
 *   name: OTP
 *   description: One-Time Password management and verification
 */

/**
 * @swagger
 * /api/v1/otp/send:
 *   post:
 *     summary: Send an OTP via WhatsApp
 *     tags: [OTP]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - message
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "6283834946034"
 *               message:
 *                 type: string
 *                 example: "Your code is 1234"
 *               code:
 *                 type: string
 *                 description: Optional code to store for verification
 *                 example: "1234"
 *               expiryMinutes:
 *                 type: number
 *                 default: 5
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/send',
    requireToken,
    validate(sendOTPSchema),
    otpController.sendOTP.bind(otpController)
);

/**
 * @swagger
 * /api/v1/otp/verify:
 *   post:
 *     summary: Verify an OTP code
 *     tags: [OTP]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "6283834946034"
 *               code:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid code or expired
 */
router.post('/verify',
    requireToken,
    validate(verifyOTPSchema),
    otpController.verifyOTP.bind(otpController)
);

/**
 * @swagger
 * /api/v1/otp/status:
 *   get:
 *     summary: Check WhatsApp connection status
 *     tags: [OTP]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current system status
 */
router.get('/status', requireToken, otpController.getStatus.bind(otpController));

module.exports = router;
