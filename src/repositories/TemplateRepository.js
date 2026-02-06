const BaseRepository = require('./BaseRepository');

class TemplateRepository extends BaseRepository {
    constructor() {
        super('templates');
    }

    async findByCode(code) {
        return await this.findOne({ code });
    }

    async findActiveTemplates(userId) {
        return await this.findAll({ userId, isActive: true });
    }

    async createTemplate(data) {
        return await this.create({
            code: data.code,
            name: data.name,
            userId: data.userId,
            content: data.content,
            language: data.language || 'en',
            variables: data.variables || ['code', 'expiry'],
            isActive: true,
            usageCount: 0
        });
    }

    async incrementUsage(templateId) {
        const template = await this.findById(templateId);
        if (!template) return null;

        return await this.update(templateId, {
            usageCount: template.usageCount + 1
        });
    }

    renderTemplate(template, variables) {
        let content = template.content;

        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, variables[key]);
        });

        return content;
    }
}

module.exports = new TemplateRepository();
