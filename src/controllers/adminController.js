const db = require('../db/wodb');
const { generateToken, hashToken } = require('../utils/crypto');
const logger = require('../utils/logger');

class AdminController {
    async generateToken(req, res) {
        try {
            const token = generateToken();
            const hash = hashToken(token);

            await db.addToken(hash);

            logger.info('New API token generated via admin route');

            res.json({
                success: true,
                token: token,
                message: 'Keep this token secure. It will not be shown again.'
            });
        } catch (error) {
            logger.error({ err: error.message }, 'Failed to generate token');
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    async getLogs(req, res) {
        try {
            const logs = await db.getLogs();
            res.json({
                success: true,
                data: logs.slice(-100) // Last 100 logs
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch logs' });
        }
    }
}

module.exports = new AdminController();
