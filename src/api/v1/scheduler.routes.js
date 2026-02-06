const express = require('express');
const router = express.Router();
const schedulerController = require('../../controllers/schedulerController');
const { requireToken } = require('../../middleware/auth');
const validate = require('../../middleware/validator');
const { scheduleOTPSchema } = require('../../validations/scheduler.validation');

/**
 * @swagger
 * tags:
 *   name: Scheduler
 *   description: Schedule OTP messages for future delivery
 */

/**
 * @swagger
 * /api/v1/scheduler/schedule:
 *   post:
 *     summary: Schedule an OTP for future delivery
 *     tags: [Scheduler]
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
 *               - scheduledTime
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "6283834946034"
 *               message:
 *                 type: string
 *                 example: "Your code is 1234"
 *               code:
 *                 type: string
 *                 example: "1234"
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-07T10:00:00Z"
 *               expiryMinutes:
 *                 type: number
 *                 default: 5
 *     responses:
 *       201:
 *         description: OTP scheduled successfully
 */
router.post('/schedule', requireToken, validate(scheduleOTPSchema), schedulerController.scheduleOTP);

/**
 * @swagger
 * /api/v1/scheduler/list:
 *   get:
 *     summary: Get all scheduled messages
 *     tags: [Scheduler]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of scheduled messages
 */
router.get('/list', requireToken, schedulerController.getScheduled);

/**
 * @swagger
 * /api/v1/scheduler/cancel/{id}:
 *   delete:
 *     summary: Cancel a scheduled message
 *     tags: [Scheduler]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled message cancelled
 */
router.delete('/cancel/:id', requireToken, schedulerController.cancelScheduled);

module.exports = router;
