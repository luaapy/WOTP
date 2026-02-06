const whatsapp = require('../services/whatsapp');
const db = require('../db/wodb');

module.exports = {
    name: 'resendotp',
    category: 'otp',
    description: 'Resend the last OTP to a phone number',
    usage: '|resendotp <phone>',
    aliases: ['resend'],
    examples: ['|resendotp 6283834946034'],

    async execute(sock, msg, args, jid) {
        if (args.length === 0) {
            await sock.sendMessage(jid, {
                text: `❌ *Invalid Usage!*

*Usage:* |resendotp <phone>

*Example:*
|resendotp 6283834946034

This will resend the last OTP sent to this number.`
            });
            return;
        }

        const phone = args[0].replace(/[^0-9]/g, '');

        if (phone.length < 10 || phone.length > 15) {
            await sock.sendMessage(jid, {
                text: '❌ Invalid phone number! Use format: 6283834946034'
            });
            return;
        }

        try {
            // Find last OTP for this phone
            const allOtps = await db.findAll('otps', { phone });

            if (allOtps.length === 0) {
                await sock.sendMessage(jid, {
                    text: `❌ *No OTP Found!*\n\n📱 Phone: +${phone}\n\nNo previous OTP found for this number.\nUse |sendotp to send a new OTP.`
                });
                return;
            }

            // Get the most recent OTP
            const lastOtp = allOtps.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )[0];

            // Send the OTP again
            await sock.sendMessage(jid, {
                text: '⏳ Resending OTP...'
            });

            const result = await whatsapp.sendOTP(phone, lastOtp.message);

            // Update status
            await db.update('otps', lastOtp.id, {
                status: 'resent',
                resentAt: new Date().toISOString(),
                resentCount: (lastOtp.resentCount || 0) + 1
            });

            const responseText = `✅ *OTP RESENT SUCCESSFULLY!*

📱 *Phone:* +${phone}
🔐 *Code:* ${lastOtp.code}
📨 *Message ID:* ${result.messageId}
🔄 *Resent Count:* ${(lastOtp.resentCount || 0) + 1}
🆔 *OTP ID:* ${lastOtp.id}

The same OTP code has been sent again.`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Failed to resend OTP!*\n\nError: ${error.message}`
            });
        }
    }
};
