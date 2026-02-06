const BaseRepository = require('./BaseRepository');
const crypto = require('crypto');

class ApiKeyRepository extends BaseRepository {
    constructor() {
        super('api_keys');
    }

    async findByKey(apiKey) {
        return await this.findOne({ key: apiKey });
    }

    async createApiKey(data) {
        const key = this.generateApiKey();
        return await this.create({
            key,
            name: data.name,
            userId: data.userId,
            permissions: data.permissions || ['otp:send', 'otp:verify'],
            rateLimit: data.rateLimit || 100,
            isActive: true,
            lastUsed: null,
            usageCount: 0
        });
    }

    async incrementUsage(apiKey) {
        const key = await this.findByKey(apiKey);
        if (!key) return null;

        return await this.update(key.id, {
            usageCount: key.usageCount + 1,
            lastUsed: new Date().toISOString()
        });
    }

    async getActiveKeys(userId) {
        return await this.findAll({ userId, isActive: true });
    }

    generateApiKey() {
        return `wotp_${crypto.randomBytes(32).toString('hex')}`;
    }
}

module.exports = new ApiKeyRepository();
