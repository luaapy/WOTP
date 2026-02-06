const BaseRepository = require('./BaseRepository');

class AnalyticsRepository extends BaseRepository {
    constructor() {
        super('analytics');
    }

    async recordEvent(data) {
        return await this.create({
            eventType: data.eventType,
            userId: data.userId,
            phone: data.phone,
            messageId: data.messageId,
            status: data.status,
            deliveryTime: data.deliveryTime || null,
            errorCode: data.errorCode || null,
            metadata: data.metadata || {}
        });
    }

    async getSuccessRate(userId, startDate, endDate) {
        const events = await this.getEventsByDateRange(userId, startDate, endDate);
        const total = events.length;
        const successful = events.filter(e => e.status === 'delivered' || e.status === 'read').length;

        return {
            total,
            successful,
            failed: total - successful,
            successRate: total > 0 ? (successful / total * 100).toFixed(2) : 0
        };
    }

    async getAverageDeliveryTime(userId, startDate, endDate) {
        const events = await this.getEventsByDateRange(userId, startDate, endDate);
        const deliveredEvents = events.filter(e => e.deliveryTime !== null);

        if (deliveredEvents.length === 0) return 0;

        const totalTime = deliveredEvents.reduce((sum, e) => sum + e.deliveryTime, 0);
        return (totalTime / deliveredEvents.length).toFixed(2);
    }

    async getEventsByDateRange(userId, startDate, endDate) {
        const allEvents = await this.findAll({ userId });
        return allEvents.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
        });
    }

    async getTopPhones(userId, limit = 10) {
        const events = await this.findAll({ userId });
        const phoneCount = {};

        events.forEach(event => {
            phoneCount[event.phone] = (phoneCount[event.phone] || 0) + 1;
        });

        return Object.entries(phoneCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([phone, count]) => ({ phone, count }));
    }

    async getDailyStats(userId, days = 7) {
        const events = await this.findAll({ userId });
        const now = new Date();
        const stats = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.createdAt);
                return eventDate >= date && eventDate < nextDate;
            });

            stats.push({
                date: date.toISOString().split('T')[0],
                total: dayEvents.length,
                successful: dayEvents.filter(e => e.status === 'delivered' || e.status === 'read').length,
                failed: dayEvents.filter(e => e.status === 'failed' || e.status === 'error').length
            });
        }

        return stats;
    }
}

module.exports = new AnalyticsRepository();
