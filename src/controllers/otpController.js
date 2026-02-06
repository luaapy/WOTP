const whatsapp = require('../services/whatsapp');
const otpStore = require('../services/otpStore');
const logger = require('../utils/logger');

class OTPController {
    /**
     * Send OTP and store it for verification
     */
    async sendOTP(req, res) {
        const { phone, message, expiryMinutes } = req.body;

        try {
            // Extract code from message if possible (looking for digits)
            // Or you can expect a 'code' field in body
            const otpCode = req.body.code || message.match(/\d{4,8}/)?.[0];

            if (otpCode) {
                await otpStore.store(phone, otpCode, expiryMinutes || 5);
            }

            const result = await whatsapp.sendOTP(phone, message);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * NEW: Verification Endpoint
     */
    async verifyOTP(req, res) {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({ success: false, error: 'Phone and code are required' });
        }

        try {
            const result = await otpStore.verify(phone, code);

            if (result.success) {
                res.json({ success: true, message: result.message });
            } else {
                res.status(400).json({ success: false, error: result.message });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    async getStatus(req, res) {
        res.json({ success: true, data: whatsapp.getStatus() });
    }
}

module.exports = new OTPController();
