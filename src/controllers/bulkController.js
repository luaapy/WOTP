const bulkService = require('../services/BulkService');
const auditLog = require('../repositories/AuditLogRepository');

class BulkController {
    async sendBulk(req, res, next) {
        try {
            const userId = req.user.id;
            const { recipients, template, metadata } = req.body;

            if (!recipients || recipients.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Recipients array is required'
                });
            }

            if (recipients.length > 1000) {
                return res.status(400).json({
                    success: false,
                    error: 'Maximum 1000 recipients per bulk operation'
                });
            }

            const result = await bulkService.createBulkOperation({
                userId,
                recipients,
                template,
                metadata
            });

            await auditLog.log({
                userId,
                action: 'bulk.send',
                resource: 'bulk_operation',
                resourceId: result.bulkId,
                details: { recipientCount: recipients.length },
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(202).json({
                success: true,
                message: 'Bulk operation started',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getBulkStatus(req, res, next) {
        try {
            const { bulkId } = req.params;

            const status = await bulkService.getBulkStatus(bulkId);

            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: 'Bulk operation not found'
                });
            }

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BulkController();
