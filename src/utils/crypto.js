const crypto = require('crypto');

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken() {
    return 'otp_' + crypto.randomBytes(32).toString('hex');
}

module.exports = { hashToken, generateToken };
