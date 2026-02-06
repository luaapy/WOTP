const db = require('../db/wodb');

module.exports = {
    name: 'verifyotp',
    category: 'otp',
    description: 'Verify an OTP code',
    usage: '|verifyotp <phone> <code>',
    aliases: ['verify', 'check'],
    examples: ['|verifyotp 6283834946034 123456'],

    async execute(sock, msg, args, jid) {
        if (args.length < 2) {
            await sock.sendMessage(jid, {
                text: `❌ *Invalid Usage!*

*Usage:* |verifyotp <phone> <code>

*Example:*
|verifyotp 6283834946034 123456

*Parameters:*
• phone - Phone number with country code
• code - OTP code to verify`
            });
            return;
        }

        const phone = args[0].replace(/[^0-9]/g, '');
        const code = args[1];

        try {
            // Find OTP in database
            const otps = await db.findAll('otps', { phone, code });

            if (otps.length === 0) {
                await sock.sendMessage(jid, {
                    text: `❌ *OTP NOT FOUND!*\n\n📱 Phone: +${phone}\n🔐 Code: ${code}\n\nPossible reasons:\n• Code is incorrect\n• Code has expired\n• No OTP was sent to this number`
                });
                return;
            }

            // Get the most recent OTP
            const otp = otps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

            // Check if expired
            const now = new Date();
            const expiresAt = new Date(otp.expiresAt);

            if (now > expiresAt) {
                await sock.sendMessage(jid, {
                    text: `❌ *OTP EXPIRED!*\n\n📱 Phone: +${phone}\n🔐 Code: ${code}\n⏰ Expired: ${Math.floor((now - expiresAt) / 1000 / 60)} minutes ago\n\nPlease request a new OTP.`
                });
                return;
            }

            // Mark as verified
            await db.update('otps', otp.id, {
                status: 'verified',
                verifiedAt: new Date().toISOString()
            });

            const timeLeft = Math.floor((expiresAt - now) / 1000 / 60);

            const responseText = `✅ *OTP VERIFIED SUCCESSFULLY!*

📱 *Phone:* +${phone}
🔐 *Code:* ${code}
✅ *Status:* Valid
⏰ *Time Left:* ${timeLeft} minutes
🆔 *OTP ID:* ${otp.id}
📅 *Sent:* ${new Date(otp.createdAt).toLocaleString()}

The OTP has been marked as verified.`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Verification Error!*\n\nError: ${error.message}\n\nPlease try again or contact support.`
            });
        }
    }
};
