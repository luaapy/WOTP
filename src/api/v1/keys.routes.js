const express = require('express');
const router = express.Router();
const apiKeyRepo = require('../../repositories/ApiKeyRepository');
const auditLog = require('../../repositories/AuditLogRepository');
const { requireToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: API key management
 */

/**
 * @swagger
 * /api/v1/keys:
 *   get:
 *     summary: Get all API keys for current user
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.get('/', requireToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const keys = await apiKeyRepo.getActiveKeys(userId);

        // Don't expose the full key, only show last 8 characters
        const sanitizedKeys = keys.map(key => ({
            id: key.id,
            name: key.name,
            keyPreview: `wotp_...${key.key.slice(-8)}`,
            permissions: key.permissions,
            rateLimit: key.rateLimit,
            usageCount: key.usageCount,
            lastUsed: key.lastUsed,
            createdAt: key.createdAt
        }));

        res.json({
            success: true,
            data: sanitizedKeys
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/keys:
 *   post:
 *     summary: Create a new API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Production API Key"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["otp:send", "otp:verify", "analytics:read"]
 *               rateLimit:
 *                 type: number
 *                 default: 100
 *     responses:
 *       201:
 *         description: API key created
 */
router.post('/', requireToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, permissions, rateLimit } = req.body;

        const apiKey = await apiKeyRepo.createApiKey({
            userId,
            name,
            permissions,
            rateLimit
        });

        await auditLog.log({
            userId,
            action: 'apikey.create',
            resource: 'api_key',
            resourceId: apiKey.id,
            details: { name },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            message: 'API key created. Save this key securely - it will not be shown again.',
            data: {
                id: apiKey.id,
                name: apiKey.name,
                key: apiKey.key, // Full key shown only once
                permissions: apiKey.permissions,
                rateLimit: apiKey.rateLimit
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/keys/{id}:
 *   delete:
 *     summary: Revoke an API key
 *     tags: [API Keys]
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
 *         description: API key revoked
 */
router.delete('/:id', requireToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const key = await apiKeyRepo.findById(id);
        if (!key || key.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        await apiKeyRepo.update(id, { isActive: false });

        await auditLog.log({
            userId,
            action: 'apikey.revoke',
            resource: 'api_key',
            resourceId: id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'API key revoked'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
