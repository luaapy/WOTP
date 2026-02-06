const commandHandler = require('../services/commandHandler');

module.exports = {
    name: 'CommandPlugin',
    async handler(sock, msg, text) {
        // Load commands if not loaded
        if (commandHandler.commands.size === 0) {
            commandHandler.loadCommands();
        }

        // Handle message through command handler
        await commandHandler.handleMessage(sock, msg, text);
    }
};
