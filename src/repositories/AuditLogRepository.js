const BaseRepository = require('./BaseRepository');

class AuditLogRepository extends BaseRepository {
    constructor() {
        super('audit_logs');
    }

    async log(data) {
        return await this.create({
            userId: data.userId,
            apiKey: data.apiKey,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details || {},
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            status: data.status || 'success',
            errorMessage: data.errorMessage || null
        });
    }

    async getByUser(userId, limit = 100) {
        const logs = await this.findAll({ userId });
        return logs.slice(-limit).reverse();
    }

    async getByAction(action, limit = 100) {
        const logs = await this.findAll({ action });
        return logs.slice(-limit).reverse();
    }

    async getByDateRange(startDate, endDate) {
        const allLogs = await this.findAll();
        return allLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            return logDate >= new Date(startDate) && logDate <= new Date(endDate);
        });
    }

    async getFailedActions(limit = 100) {
        const logs = await this.findAll({ status: 'failed' });
        return logs.slice(-limit).reverse();
    }
}

module.exports = new AuditLogRepository();
