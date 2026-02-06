const { addMinutes, isAfter } = require('date-fns');
const logger = require('../utils/logger');

class OTPStore {
    constructor() {
        // In-memory store (bisa dipindah ke Redis nanti)
        this.otps = new Map();
        // Cleanup interval setiap 5 menit
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Store a new OTP
     * @param {string} phone 
     * @param {string} code 
     * @param {number} expiryMinutes 
     */
    async store(phone, code, expiryMinutes = 5) {
        const expiry = addMinutes(new Date(), expiryMinutes);
        this.otps.set(phone, {
            code,
            expiry,
            attempts: 0
        });
        logger.info({ phone, expiry }, 'OTP stored in memory');
    }

    /**
     * Verify an OTP
     * @param {string} phone 
     * @param {string} code 
     * @returns {Object} { success: boolean, message: string }
     */
    async verify(phone, code) {
        const data = this.otps.get(phone);

        if (!data) {
            return { success: false, message: 'OTP not found or already used' };
        }

        if (isAfter(new Date(), data.expiry)) {
            this.otps.delete(phone);
            return { success: false, message: 'OTP has expired' };
        }

        if (data.attempts >= 3) {
            this.otps.delete(phone);
            return { success: false, message: 'Too many failed attempts' };
        }

        if (data.code !== code) {
            data.attempts++;
            return { success: false, message: 'Invalid OTP code' };
        }

        // Success!
        this.otps.delete(phone);
        return { success: true, message: 'OTP verified successfully' };
    }

    cleanup() {
        const now = new Date();
        for (const [phone, data] of this.otps.entries()) {
            if (isAfter(now, data.expiry)) {
                this.otps.delete(phone);
            }
        }
    }
}

module.exports = new OTPStore();
