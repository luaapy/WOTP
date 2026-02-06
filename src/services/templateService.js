const logger = require('../utils/logger');

class TemplateService {
    constructor() {
        this.templates = new Map([
            ['OTP_LOGIN', 'Kode keamanan Login Anda adalah: {{code}}. Rahasiakan kode ini.'],
            ['OTP_VERIFY', 'Halo! Gunakan kode {{code}} untuk verifikasi akun Anda.'],
            ['WELCOME', 'Selamat datang di layanan kami! Akun Anda telah aktif.']
        ]);
    }

    render(templateName, variables = {}) {
        let template = this.templates.get(templateName);
        if (!template) return null;

        for (const [key, value] of Object.entries(variables)) {
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return template;
    }

    addTemplate(name, text) {
        this.templates.set(name, text);
        logger.info({ name }, 'New template added');
    }

    getAll() {
        return Array.from(this.templates.entries()).map(([name, text]) => ({ name, text }));
    }
}

module.exports = new TemplateService();
