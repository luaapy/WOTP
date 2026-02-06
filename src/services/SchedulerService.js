const BaseRepository = require('../repositories/BaseRepository');
const logger = require('../utils/logger');
const whatsapp = require('./whatsapp');

class SchedulerService extends BaseRepository {
    constructor() {
        super('scheduled_messages');
        this.checkInterval = null;
    }

    async init() {
        // Check for scheduled messages every 30 seconds
        this.checkInterval = setInterval(() => this.processScheduled(), 30000);
        logger.info('📅 Scheduler Service initialized');
    }

    async scheduleOTP(data) {
        const scheduledTime = new Date(data.scheduledTime);

        if (scheduledTime <= new Date()) {
            throw new Error('Scheduled time must be in the future');
        }

        return await this.create({
            userId: data.userId,
            phone: data.phone,
            message: data.message,
            code: data.code,
            expiryMinutes: data.expiryMinutes,
            scheduledTime: scheduledTime.toISOString(),
            status: 'pending',
            attempts: 0,
            maxAttempts: data.maxAttempts || 3,
            metadata: data.metadata || {}
        });
    }

    async processScheduled() {
        try {
            const now = new Date().toISOString();
            const pending = await this.findAll({ status: 'pending' });

            const due = pending.filter(msg => msg.scheduledTime <= now);

            for (const message of due) {
                await this.sendScheduledMessage(message);
            }
        } catch (error) {
            logger.error({ error }, 'Error processing scheduled messages');
        }
    }

    async sendScheduledMessage(message) {
        try {
            await whatsapp.sendOTP(message.phone, message.message);

            await this.update(message.id, {
                status: 'sent',
                sentAt: new Date().toISOString()
            });

            logger.info({ messageId: message.id }, 'Scheduled message sent');
        } catch (error) {
            const attempts = message.attempts + 1;

            if (attempts >= message.maxAttempts) {
                await this.update(message.id, {
                    status: 'failed',
                    attempts,
                    error: error.message
                });
            } else {
                // Retry in 5 minutes
                const retryTime = new Date();
                retryTime.setMinutes(retryTime.getMinutes() + 5);

                await this.update(message.id, {
                    attempts,
                    scheduledTime: retryTime.toISOString(),
                    lastError: error.message
                });
            }

            logger.error({ error, messageId: message.id }, 'Failed to send scheduled message');
        }
    }

    async cancelScheduled(messageId) {
        return await this.update(messageId, { status: 'cancelled' });
    }

    async getScheduledByUser(userId) {
        return await this.findAll({ userId, status: 'pending' });
    }

    shutdown() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            logger.info('📅 Scheduler Service shutdown');
        }
    }
}

module.exports = new SchedulerService();
