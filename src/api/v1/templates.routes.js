const express = require('express');
const router = express.Router();
const templateController = require('../../controllers/templateController');
const { requireToken } = require('../../middleware/auth');
const validate = require('../../middleware/validator');
const { createTemplateSchema, updateTemplateSchema } = require('../../validations/template.validation');

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: OTP message template management
 */

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/', requireToken, templateController.getTemplates);

/**
 * @swagger
 * /api/v1/templates:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - content
 *             properties:
 *               code:
 *                 type: string
 *                 example: "welcome_otp"
 *               name:
 *                 type: string
 *                 example: "Welcome OTP Template"
 *               content:
 *                 type: string
 *                 example: "Welcome! Your OTP code is {{code}}. Valid for {{expiry}} minutes."
 *               language:
 *                 type: string
 *                 default: "en"
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["code", "expiry"]
 *     responses:
 *       201:
 *         description: Template created
 */
router.post('/', requireToken, validate(createTemplateSchema), templateController.createTemplate);

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   put:
 *     summary: Update a template
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Template updated
 */
router.put('/:id', requireToken, validate(updateTemplateSchema), templateController.updateTemplate);

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
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
 *         description: Template deleted
 */
router.delete('/:id', requireToken, templateController.deleteTemplate);

module.exports = router;
