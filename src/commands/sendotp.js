const whatsapp = require('../services/whatsapp');
const db = require('../db/wodb');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'sendotp',
    category: 'otp',
    description: 'Send OTP to a phone number',
    usage: '|sendotp <phone> <code> [message]',
    aliases: ['send', 'otp'],
    examples: [
        '|sendotp 6283834946034 123456',
        '|sendotp 6283834946034 123456 Your verification code is'
    ],

    async execute(sock, msg, args, jid) {
        if (args.length < 2) {
            await sock.sendMessage(jid, {
                text: `❌ *Invalid Usage!*

*Usage:* |sendotp <phone> <code> [message]

*Examples:*
• |sendotp 6283834946034 123456
• |sendotp 6283834946034 123456 Your code is

*Parameters:*
• phone - Phone number with country code
• code - OTP code (4-8 digits)
• message - Optional custom message`
            });
            return;
        }

        const phone = args[0].replace(/[^0-9]/g, '');
        const code = args[1];
        const customMessage = args.slice(2).join(' ');

        // Validate phone number
        if (phone.length < 10 || phone.length > 15) {
            await sock.sendMessage(jid, {
                text: '❌ Invalid phone number! Use format: 6283834946034'
            });
            return;
        }

        // Validate OTP code
        if (!/^\d{4,8}$/.test(code)) {
            await sock.sendMessage(jid, {
                text: '❌ Invalid OTP code! Use 4-8 digits only.'
            });
            return;
        }

        try {
            // Create OTP message
            const message = customMessage
                ? `${customMessage} ${code}`
                : `Your OTP verification code is: *${code}*\n\nThis code will expire in 5 minutes.\nDo not share this code with anyone.`;

            // Send via WhatsApp
            await sock.sendMessage(jid, {
                text: '⏳ Sending OTP...'
            });

            const result = await whatsapp.sendOTP(phone, message);

            // Save to database
            const otpId = uuidv4();
            await db.create('otps', {
                id: otpId,
                phone: phone,
                code: code,
                message: message,
                status: 'sent',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            });

            const responseText = `✅ *OTP SENT SUCCESSFULLY!*

📱 *Phone:* +${phone}
🔐 *Code:* ${code}
📨 *Message ID:* ${result.messageId}
⏰ *Expires:* 5 minutes
🆔 *OTP ID:* ${otpId}

Type |otpstatus ${otpId} to check delivery status.`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Failed to send OTP!*\n\nError: ${error.message}\n\nPlease check:\n• WhatsApp is connected\n• Phone number is valid\n• Bot has permission to send messages`
            });
        }
    }
};
