const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { requireToken } = require('../middleware/auth');

router.post('/send-otp', requireToken, otpController.sendOTP.bind(otpController));
router.post('/verify-otp', requireToken, otpController.verifyOTP.bind(otpController));
router.get('/status', requireToken, otpController.getStatus.bind(otpController));

module.exports = router;
