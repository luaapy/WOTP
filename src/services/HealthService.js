const os = require('os');
const whatsapp = require('./whatsapp');
const db = require('../db/wodb');

class HealthService {
    async getHealthStatus() {
        const checks = await Promise.allSettled([
            this.checkWhatsApp(),
            this.checkDatabase(),
            this.checkMemory(),
            this.checkDisk()
        ]);

        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {
                whatsapp: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'unhealthy', error: checks[0].reason?.message },
                database: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'unhealthy', error: checks[1].reason?.message },
                memory: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'unhealthy', error: checks[2].reason?.message },
                disk: checks[3].status === 'fulfilled' ? checks[3].value : { status: 'unhealthy', error: checks[3].reason?.message }
            }
        };

        // Overall status is unhealthy if any check fails
        const hasUnhealthy = Object.values(health.checks).some(check => check.status === 'unhealthy');
        if (hasUnhealthy) {
            health.status = 'unhealthy';
        }

        return health;
    }

    async checkWhatsApp() {
        try {
            const status = whatsapp.getStatus();
            return {
                status: status.connected ? 'healthy' : 'unhealthy',
                connected: status.connected,
                uptime: status.uptime
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async checkDatabase() {
        try {
            // Try to read from database
            await db.read('otp_codes');
            return {
                status: 'healthy',
                message: 'Database accessible'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async checkMemory() {
        const used = process.memoryUsage();
        const total = os.totalmem();
        const free = os.freemem();
        const usedPercent = ((total - free) / total * 100).toFixed(2);

        return {
            status: usedPercent > 90 ? 'unhealthy' : 'healthy',
            heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            systemUsed: `${usedPercent}%`,
            systemTotal: `${(total / 1024 / 1024 / 1024).toFixed(2)} GB`
        };
    }

    async checkDisk() {
        // Basic disk check - in production, use a proper disk monitoring library
        return {
            status: 'healthy',
            message: 'Disk check not implemented'
        };
    }

    getMetrics() {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();

        return {
            timestamp: new Date().toISOString(),
            process: {
                uptime: process.uptime(),
                pid: process.pid,
                version: process.version,
                memoryUsage: process.memoryUsage()
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                cpus: cpus.length,
                loadAverage: {
                    '1min': loadAvg[0].toFixed(2),
                    '5min': loadAvg[1].toFixed(2),
                    '15min': loadAvg[2].toFixed(2)
                },
                totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
            }
        };
    }
}

module.exports = new HealthService();
