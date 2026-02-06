const db = require('../db/wodb');

module.exports = {
    name: 'otpstatus',
    category: 'otp',
    description: 'Check OTP delivery status',
    usage: '|otpstatus <otp_id>',
    aliases: ['checkstatus', 'otpcheck'],
    examples: ['|otpstatus abc123-def456'],

    async execute(sock, msg, args, jid) {
        if (args.length === 0) {
            await sock.sendMessage(jid, {
                text: `❌ *Invalid Usage!*

*Usage:* |otpstatus <otp_id>

*Example:*
|otpstatus abc123-def456

Get the OTP ID from the sendotp response.`
            });
            return;
        }

        const otpId = args[0];

        try {
            const otp = await db.findById('otps', otpId);

            if (!otp) {
                await sock.sendMessage(jid, {
                    text: `❌ *OTP NOT FOUND!*\n\nOTP ID: ${otpId}\n\nPlease check the ID and try again.`
                });
                return;
            }

            const now = new Date();
            const expiresAt = new Date(otp.expiresAt);
            const isExpired = now > expiresAt;
            const timeLeft = isExpired ? 0 : Math.floor((expiresAt - now) / 1000 / 60);

            const statusEmoji = {
                'sent': '📤',
                'delivered': '✅',
                'read': '👁️',
                'verified': '✅',
                'expired': '⏰',
                'failed': '❌'
            };

            const currentStatus = isExpired && otp.status !== 'verified' ? 'expired' : otp.status;

            const responseText = `📊 *OTP STATUS*

🆔 *OTP ID:* ${otp.id}
📱 *Phone:* +${otp.phone}
🔐 *Code:* ${otp.code}
${statusEmoji[currentStatus] || '📋'} *Status:* ${currentStatus.toUpperCase()}

📅 *Created:* ${new Date(otp.createdAt).toLocaleString()}
⏰ *Expires:* ${new Date(otp.expiresAt).toLocaleString()}
⏱️ *Time Left:* ${timeLeft} minutes

${otp.verifiedAt ? `✅ *Verified:* ${new Date(otp.verifiedAt).toLocaleString()}` : ''}

${isExpired && otp.status !== 'verified' ? '⚠️ This OTP has expired!' : ''}`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Error checking status!*\n\nError: ${error.message}`
            });
        }
    }
};
