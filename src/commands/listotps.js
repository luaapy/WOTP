const db = require('../db/wodb');

module.exports = {
    name: 'listotps',
    category: 'otp',
    description: 'List recent OTPs',
    usage: '|listotps [limit]',
    aliases: ['otplist', 'otps'],
    examples: ['|listotps', '|listotps 10'],

    async execute(sock, msg, args, jid) {
        const limit = args[0] ? parseInt(args[0]) : 10;

        if (isNaN(limit) || limit < 1 || limit > 50) {
            await sock.sendMessage(jid, {
                text: '❌ Invalid limit! Use 1-50.\n\nExample: |listotps 10'
            });
            return;
        }

        try {
            const allOtps = await db.findAll('otps', {});

            if (allOtps.length === 0) {
                await sock.sendMessage(jid, {
                    text: '📭 *NO OTPs FOUND*\n\nNo OTPs have been sent yet.\n\nUse |sendotp to send your first OTP!'
                });
                return;
            }

            // Sort by creation date (newest first)
            const sortedOtps = allOtps
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);

            let responseText = `📋 *RECENT OTPs* (${sortedOtps.length}/${allOtps.length})\n\n`;

            sortedOtps.forEach((otp, index) => {
                const now = new Date();
                const expiresAt = new Date(otp.expiresAt);
                const isExpired = now > expiresAt;
                const status = isExpired && otp.status !== 'verified' ? 'expired' : otp.status;

                responseText += `${index + 1}. 📱 +${otp.phone}\n`;
                responseText += `   🔐 Code: ${otp.code}\n`;
                responseText += `   📊 Status: ${status.toUpperCase()}\n`;
                responseText += `   📅 ${new Date(otp.createdAt).toLocaleString()}\n`;
                responseText += `   🆔 ${otp.id.substring(0, 8)}...\n\n`;
            });

            responseText += `Type |otpstatus <id> for details.`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Error fetching OTPs!*\n\nError: ${error.message}`
            });
        }
    }
};
