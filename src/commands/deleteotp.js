const db = require('../db/wodb');

module.exports = {
    name: 'deleteotp',
    category: 'otp',
    description: 'Delete an OTP record',
    usage: '|deleteotp <otp_id>',
    aliases: ['removeotp', 'delotp'],
    examples: ['|deleteotp abc123-def456'],

    async execute(sock, msg, args, jid) {
        if (args.length === 0) {
            await sock.sendMessage(jid, {
                text: `❌ *Invalid Usage!*

*Usage:* |deleteotp <otp_id>

*Example:*
|deleteotp abc123-def456

Get the OTP ID from |listotps or |otpstatus.`
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

            // Delete the OTP
            await db.delete('otps', otpId);

            const responseText = `✅ *OTP DELETED SUCCESSFULLY!*

🆔 *OTP ID:* ${otpId}
📱 *Phone:* +${otp.phone}
🔐 *Code:* ${otp.code}
📅 *Created:* ${new Date(otp.createdAt).toLocaleString()}

The OTP record has been permanently deleted.`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Error deleting OTP!*\n\nError: ${error.message}`
            });
        }
    }
};
