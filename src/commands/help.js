module.exports = {
    name: 'help',
    aliases: ['menu', 'commands'],
    category: 'general',
    description: 'Show all available commands',
    usage: '|help [command]',

    async execute(sock, msg, args, jid) {
        if (args.length > 0) {
            // Show help for specific command
            const commandName = args[0].toLowerCase();
            const commandHandler = require('../services/commandHandler');
            const command = commandHandler.commands.get(commandName);

            if (!command) {
                await sock.sendMessage(jid, {
                    text: `❌ Command *${commandName}* not found!`
                });
                return;
            }

            let helpText = `📖 *COMMAND HELP*\n\n`;
            helpText += `*Name:* ${command.name}\n`;
            helpText += `*Category:* ${command.category}\n`;
            helpText += `*Description:* ${command.description}\n`;
            helpText += `*Usage:* ${command.usage}\n`;

            if (command.aliases && command.aliases.length > 0) {
                helpText += `*Aliases:* ${command.aliases.join(', ')}\n`;
            }

            if (command.examples && command.examples.length > 0) {
                helpText += `\n*Examples:*\n`;
                command.examples.forEach(ex => {
                    helpText += `• ${ex}\n`;
                });
            }

            await sock.sendMessage(jid, { text: helpText });
            return;
        }

        // Show main help menu
        const helpText = `📋 *WOTP BOT - OTP PLATFORM*

🤖 *Enterprise WhatsApp OTP Gateway*
Prefix: *|*

📱 *OTP COMMANDS:*

*Send & Manage:*
|sendotp <phone> <code> [msg] - Send OTP
|verifyotp <phone> <code> - Verify OTP
|resendotp <phone> - Resend last OTP
|otpstatus <id> - Check OTP status
|listotps [limit] - List recent OTPs
|searchotp <query> - Search OTPs
|deleteotp <id> - Delete OTP
|clearotps - Clear expired OTPs

*Statistics:*
|otpstats [days] - View statistics

*System:*
|help [command] - Show help
|ping - Check latency
|status - Bot status
|calc <expression> - Calculator

💡 *QUICK START:*
• |sendotp 6283834946034 123456
• |verifyotp 6283834946034 123456
• |otpstats 7
• |listotps 10

📖 *EXAMPLES:*
|sendotp 6283834946034 123456
|sendotp 6283834946034 123456 Your code is
|verifyotp 6283834946034 123456
|resendotp 6283834946034
|searchotp 628383
|clearotps

🔗 *RESOURCES:*
• API Docs: http://localhost:3000/docs
• Support: admin@wotp-gateway.pro

✅ *Total: 13 Working Commands*

Type |help <command> for detailed help on any command.`;

        await sock.sendMessage(jid, { text: helpText });
    }
};
