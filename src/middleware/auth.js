const config = require('../config');
const db = require('../db/wodb');
const { hashToken } = require('../utils/crypto');

const requireMasterKey = (req, res, next) => {
    const key = req.headers['x-master-key'];
    if (!key || key !== config.masterPassword) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Master Key' });
    }
    next();
};

const requireToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Missing Token' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Support both old token format and new API key format
    if (token.startsWith('wotp_')) {
        // New API key format
        const apiKeyRepo = require('../repositories/ApiKeyRepository');
        const apiKey = await apiKeyRepo.findByKey(token);

        if (!apiKey || !apiKey.isActive) {
            return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
        }

        // Attach user context
        req.user = {
            id: apiKey.userId,
            apiKeyId: apiKey.id,
            permissions: apiKey.permissions
        };
        req.apiKey = token;

        // Increment usage count
        await apiKeyRepo.incrementUsage(token);

        next();
    } else if (token.startsWith('otp_')) {
        // Legacy token format
        const hash = hashToken(token);

        const tokens = await db.getTokens();
        const validToken = tokens.find(t => t.hash === hash);

        if (!validToken) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
        }

        // Attach default user context for legacy tokens
        req.user = {
            id: 'default_user',
            permissions: ['otp:send', 'otp:verify']
        };
        req.tokenHash = hash;

        next();
    } else {
        return res.status(401).json({ error: 'Unauthorized: Invalid Token Format' });
    }
};

module.exports = { requireMasterKey, requireToken };
