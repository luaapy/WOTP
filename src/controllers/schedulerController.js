const schedulerService = require('../services/SchedulerService');
const auditLog = require('../repositories/AuditLogRepository');

class SchedulerController {
    async scheduleOTP(req, res, next) {
        try {
            const userId = req.user.id;
            const { phone, message, code, scheduledTime, expiryMinutes } = req.body;

            const scheduled = await schedulerService.scheduleOTP({
                userId,
                phone,
                message,
                code,
                scheduledTime,
                expiryMinutes
            });

            await auditLog.log({
                userId,
                action: 'scheduler.schedule',
                resource: 'scheduled_message',
                resourceId: scheduled.id,
                details: { phone, scheduledTime },
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                success: true,
                message: 'OTP scheduled successfully',
                data: scheduled
            });
        } catch (error) {
            next(error);
        }
    }

    async getScheduled(req, res, next) {
        try {
            const userId = req.user.id;
            const scheduled = await schedulerService.getScheduledByUser(userId);

            res.json({
                success: true,
                data: scheduled
            });
        } catch (error) {
            next(error);
        }
    }

    async cancelScheduled(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const message = await schedulerService.findById(id);
            if (!message || message.userId !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Scheduled message not found'
                });
            }

            await schedulerService.cancelScheduled(id);

            await auditLog.log({
                userId,
                action: 'scheduler.cancel',
                resource: 'scheduled_message',
                resourceId: id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                success: true,
                message: 'Scheduled message cancelled'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SchedulerController();
