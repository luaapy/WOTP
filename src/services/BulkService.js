const BaseRepository = require('../repositories/BaseRepository');
const logger = require('../utils/logger');
const whatsapp = require('./whatsapp');
const { v4: uuidv4 } = require('uuid');

class BulkService extends BaseRepository {
    constructor() {
        super('bulk_operations');
    }

    async createBulkOperation(data) {
        const bulkId = uuidv4();

        const operation = await this.create({
            bulkId,
            userId: data.userId,
            type: data.type || 'otp',
            totalRecipients: data.recipients.length,
            processed: 0,
            successful: 0,
            failed: 0,
            status: 'pending',
            recipients: data.recipients,
            template: data.template,
            metadata: data.metadata || {}
        });

        // Start processing in background
        this.processBulkOperation(operation).catch(err => {
            logger.error({ err, bulkId }, 'Bulk operation failed');
        });

        return { bulkId, status: 'processing', total: data.recipients.length };
    }

    async processBulkOperation(operation) {
        try {
            await this.update(operation.id, { status: 'processing' });

            const results = [];

            for (const recipient of operation.recipients) {
                try {
                    // Add delay to avoid rate limiting
                    await this.delay(1000);

                    const message = this.renderMessage(operation.template, recipient);
                    await whatsapp.sendOTP(recipient.phone, message);

                    results.push({
                        phone: recipient.phone,
                        status: 'success'
                    });

                    operation.successful++;
                } catch (error) {
                    results.push({
                        phone: recipient.phone,
                        status: 'failed',
                        error: error.message
                    });

                    operation.failed++;
                }

                operation.processed++;

                // Update progress every 10 messages
                if (operation.processed % 10 === 0) {
                    await this.update(operation.id, {
                        processed: operation.processed,
                        successful: operation.successful,
                        failed: operation.failed
                    });
                }
            }

            await this.update(operation.id, {
                status: 'completed',
                processed: operation.processed,
                successful: operation.successful,
                failed: operation.failed,
                results,
                completedAt: new Date().toISOString()
            });

            logger.info({ bulkId: operation.bulkId }, 'Bulk operation completed');
        } catch (error) {
            await this.update(operation.id, {
                status: 'failed',
                error: error.message
            });

            throw error;
        }
    }

    async getBulkStatus(bulkId) {
        const operation = await this.findOne({ bulkId });

        if (!operation) {
            return null;
        }

        return {
            bulkId: operation.bulkId,
            status: operation.status,
            total: operation.totalRecipients,
            processed: operation.processed,
            successful: operation.successful,
            failed: operation.failed,
            progress: operation.totalRecipients > 0
                ? ((operation.processed / operation.totalRecipients) * 100).toFixed(2)
                : 0,
            createdAt: operation.createdAt,
            completedAt: operation.completedAt
        };
    }

    renderMessage(template, recipient) {
        let message = template;

        Object.keys(recipient).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            message = message.replace(regex, recipient[key]);
        });

        return message;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new BulkService();
