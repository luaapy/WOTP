const analyticsRepo = require('../repositories/AnalyticsRepository');
const auditLog = require('../repositories/AuditLogRepository');

class AnalyticsController {
    async getDashboard(req, res, next) {
        try {
            const days = parseInt(req.query.days) || 7;
            const userId = req.user.id;

            const dailyStats = await analyticsRepo.getDailyStats(userId, days);
            const topPhones = await analyticsRepo.getTopPhones(userId, 5);

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const successRate = await analyticsRepo.getSuccessRate(userId, startDate, endDate);
            const avgDeliveryTime = await analyticsRepo.getAverageDeliveryTime(userId, startDate, endDate);

            await auditLog.log({
                userId,
                action: 'analytics.view_dashboard',
                resource: 'analytics',
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                success: true,
                data: {
                    dailyStats,
                    topPhones,
                    successRate,
                    averageDeliveryTime: `${avgDeliveryTime}s`,
                    period: `${days} days`
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getSuccessRate(req, res, next) {
        try {
            const userId = req.user.id;
            const startDate = req.query.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const endDate = req.query.endDate || new Date();

            const stats = await analyticsRepo.getSuccessRate(userId, startDate, endDate);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async getDeliveryTime(req, res, next) {
        try {
            const userId = req.user.id;
            const startDate = req.query.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const endDate = req.query.endDate || new Date();

            const avgTime = await analyticsRepo.getAverageDeliveryTime(userId, startDate, endDate);

            res.json({
                success: true,
                data: {
                    averageDeliveryTime: avgTime,
                    unit: 'seconds'
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getTopPhones(req, res, next) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;

            const topPhones = await analyticsRepo.getTopPhones(userId, limit);

            res.json({
                success: true,
                data: topPhones
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AnalyticsController();
