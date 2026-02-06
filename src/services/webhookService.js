const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class WebhookService {
    constructor() {
        this.enabled = config.webhookEnabled;
        this.url = config.webhookUrl;
    }

    async notify(event, data) {
        if (!this.enabled || !this.url) return;

        try {
            logger.info({ event, url: this.url }, 'Sending webhook notification');
            await axios.post(this.url, {
                event,
                timestamp: new Date().toISOString(),
                data
            }, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            logger.error({
                err: error.message,
                url: this.url
            }, 'Webhook notification failed');
        }
    }
}

module.exports = new WebhookService();
