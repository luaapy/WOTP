const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.pluginDir = path.join(__dirname, '../plugins');
    }

    async loadPlugins(sock) {
        if (!fs.existsSync(this.pluginDir)) return;

        const files = fs.readdirSync(this.pluginDir).filter(f => f.endsWith('.js'));

        for (const file of files) {
            try {
                const plugin = require(path.join(this.pluginDir, file));
                if (plugin.name && typeof plugin.handler === 'function') {
                    this.plugins.set(plugin.name, plugin);
                    logger.info({ plugin: plugin.name }, 'Plugin loaded successfully');
                }
            } catch (error) {
                logger.error({ file, err: error.message }, 'Failed to load plugin');
            }
        }
    }

    async handleMessage(sock, msg, text) {
        for (const [name, plugin] of this.plugins) {
            try {
                // If plugin has a trigger (like a prefix or keyword)
                if (plugin.trigger && text.toLowerCase().startsWith(plugin.trigger)) {
                    await plugin.handler(sock, msg, text);
                }
                // Or if it's a passive listener (handles everything)
                else if (!plugin.trigger) {
                    await plugin.handler(sock, msg, text);
                }
            } catch (error) {
                logger.error({ plugin: name, err: error.message }, 'Plugin execution error');
            }
        }
    }
}

module.exports = new PluginManager();
