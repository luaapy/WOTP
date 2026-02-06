const db = require('../db/wodb');

module.exports = {
    name: 'clearotps',
    category: 'otp',
    description: 'Clear all expired OTPs',
    usage: '|clearotps',
    aliases: ['cleanup', 'clearexpired'],

    async execute(sock, msg, args, jid) {
        try {
            const allOtps = await db.findAll('otps', {});

            if (allOtps.length === 0) {
                await sock.sendMessage(jid, {
                    text: '📭 *NO OTPs TO CLEAR*\n\nThe database is already empty.'
                });
                return;
            }

            const now = new Date();
            let deletedCount = 0;

            // Delete expired OTPs
            for (const otp of allOtps) {
                const expiresAt = new Date(otp.expiresAt);
                if (now > expiresAt && otp.status !== 'verified') {
                    await db.delete('otps', otp.id);
                    deletedCount++;
                }
            }

            const responseText = `✅ *CLEANUP COMPLETED!*

🗑️ *Deleted:* ${deletedCount} expired OTPs
📊 *Remaining:* ${allOtps.length - deletedCount} OTPs
📅 *Cleaned at:* ${now.toLocaleString()}

All expired OTPs have been removed from the database.`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Cleanup Error!*\n\nError: ${error.message}`
            });
        }
    }
};
