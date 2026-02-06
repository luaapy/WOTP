const db = require('../db/wodb');

module.exports = {
    name: 'otpstats',
    category: 'otp',
    description: 'View OTP statistics',
    usage: '|otpstats [days]',
    aliases: ['stats', 'statistics'],
    examples: ['|otpstats', '|otpstats 7'],

    async execute(sock, msg, args, jid) {
        const days = args[0] ? parseInt(args[0]) : 30;

        if (isNaN(days) || days < 1 || days > 365) {
            await sock.sendMessage(jid, {
                text: '❌ Invalid days! Use 1-365.\n\nExample: |otpstats 7'
            });
            return;
        }

        try {
            const allOtps = await db.findAll('otps', {});

            if (allOtps.length === 0) {
                await sock.sendMessage(jid, {
                    text: '📊 *NO DATA AVAILABLE*\n\nNo OTPs have been sent yet.'
                });
                return;
            }

            // Filter by date range
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const recentOtps = allOtps.filter(otp =>
                new Date(otp.createdAt) >= cutoffDate
            );

            // Calculate statistics
            const total = recentOtps.length;
            const verified = recentOtps.filter(otp => otp.status === 'verified').length;
            const expired = recentOtps.filter(otp => {
                const now = new Date();
                const expiresAt = new Date(otp.expiresAt);
                return now > expiresAt && otp.status !== 'verified';
            }).length;
            const pending = total - verified - expired;

            const successRate = total > 0 ? ((verified / total) * 100).toFixed(1) : 0;

            // Count unique phones
            const uniquePhones = new Set(recentOtps.map(otp => otp.phone)).size;

            // Average per day
            const avgPerDay = (total / days).toFixed(1);

            const responseText = `📊 *OTP STATISTICS*
            
📅 *Period:* Last ${days} days

📈 *Overview:*
• Total OTPs: ${total}
• Verified: ${verified} (${successRate}%)
• Pending: ${pending}
• Expired: ${expired}

📱 *Users:*
• Unique Numbers: ${uniquePhones}
• Avg per Day: ${avgPerDay}

✅ *Success Rate:* ${successRate}%

${successRate >= 80 ? '🎉 Excellent performance!' : successRate >= 60 ? '👍 Good performance!' : '⚠️ Consider reviewing OTP delivery.'}`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Error calculating statistics!*\n\nError: ${error.message}`
            });
        }
    }
};
