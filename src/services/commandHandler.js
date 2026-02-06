/**
 * Command Handler
 * Loads and executes commands from the commands folder
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.prefix = '|';
        this.commandsDir = path.join(__dirname, '../commands');
    }

    /**
     * Load all commands from commands directory
     */
    loadCommands() {
        if (!fs.existsSync(this.commandsDir)) {
            logger.warn('Commands directory not found');
            return;
        }

        const files = fs.readdirSync(this.commandsDir).filter(f => f.endsWith('.js'));

        for (const file of files) {
            try {
                const command = require(path.join(this.commandsDir, file));

                if (command.name && typeof command.execute === 'function') {
                    this.commands.set(command.name, command);

                    // Register aliases
                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            this.commands.set(alias, command);
                        });
                    }

                    logger.info({ command: command.name }, 'Command loaded');
                }
            } catch (error) {
                logger.error({ file, err: error.message }, 'Failed to load command');
            }
        }

        logger.info({ count: this.commands.size }, 'Commands loaded successfully');
    }

    /**
     * Handle incoming message
     */
    async handleMessage(sock, msg, text) {
        // Ignore messages from self
        if (msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const lowText = text.toLowerCase().trim();

        // Auto-reply for greetings without prefix
        if (!lowText.startsWith(this.prefix)) {
            const greetings = {
                'hi': '👋 Hi! Type *|help* to see all available commands!',
                'hello': '👋 Hello! Type *|help* to see all available commands!',
                'halo': '👋 Hello! Type *|help* to see all available commands!',
                'test': '✅ Bot is active! Type *|help* to see all commands.'
            };

            for (const [key, val] of Object.entries(greetings)) {
                if (lowText.includes(key)) {
                    await sock.sendMessage(jid, { text: val });
                    return;
                }
            }
            return;
        }

        // Parse command
        const args = lowText.slice(this.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        // Get command
        const command = this.commands.get(commandName);

        if (!command) {
            await sock.sendMessage(jid, {
                text: `❌ *Command not found!*\n\nCommand: |${commandName}\n\nType *|help* to see all available commands.`
            });
            return;
        }

        // Execute command
        try {
            await command.execute(sock, msg, args, jid);
        } catch (error) {
            logger.error({ command: commandName, err: error.message }, 'Command execution error');
            await sock.sendMessage(jid, {
                text: `❌ *Error executing command!*\n\nError: ${error.message}\n\nPlease try again or contact support.`
            });
        }
    }

    /**
     * Get all commands
     */
    getAllCommands() {
        const uniqueCommands = new Map();

        for (const [name, command] of this.commands) {
            if (!uniqueCommands.has(command.name)) {
                uniqueCommands.set(command.name, command);
            }
        }

        return Array.from(uniqueCommands.values());
    }

    /**
     * Get commands by category
     */
    getCommandsByCategory(category) {
        return this.getAllCommands().filter(cmd => cmd.category === category);
    }
}

module.exports = new CommandHandler();
