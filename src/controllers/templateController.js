const templateRepo = require('../repositories/TemplateRepository');
const auditLog = require('../repositories/AuditLogRepository');

class TemplateController {
    async getTemplates(req, res, next) {
        try {
            const userId = req.user.id;
            const templates = await templateRepo.findActiveTemplates(userId);

            res.json({
                success: true,
                data: templates
            });
        } catch (error) {
            next(error);
        }
    }

    async createTemplate(req, res, next) {
        try {
            const userId = req.user.id;
            const { code, name, content, language, variables } = req.body;

            // Check if template code already exists
            const existing = await templateRepo.findByCode(code);
            if (existing && existing.userId === userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Template code already exists'
                });
            }

            const template = await templateRepo.createTemplate({
                code,
                name,
                content,
                language,
                variables,
                userId
            });

            await auditLog.log({
                userId,
                action: 'template.create',
                resource: 'template',
                resourceId: template.id,
                details: { code, name },
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                success: true,
                data: template
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTemplate(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const updates = req.body;

            const template = await templateRepo.findById(id);
            if (!template || template.userId !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Template not found'
                });
            }

            const updated = await templateRepo.update(id, updates);

            await auditLog.log({
                userId,
                action: 'template.update',
                resource: 'template',
                resourceId: id,
                details: updates,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                success: true,
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTemplate(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const template = await templateRepo.findById(id);
            if (!template || template.userId !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Template not found'
                });
            }

            await templateRepo.delete(id);

            await auditLog.log({
                userId,
                action: 'template.delete',
                resource: 'template',
                resourceId: id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                success: true,
                message: 'Template deleted'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TemplateController();
