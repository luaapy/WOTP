# WhatsApp Bot Troubleshooting Guide

## Issue: Bot Not Responding to Messages

### Quick Diagnosis

1. **Check if bot is connected**
   ```bash
   curl http://localhost:3000/api/v1/otp/status
   ```

2. **Check server logs**
   - Look for "WhatsApp Online" message
   - Check for connection errors

3. **Test with a simple message**
   - Send "test" to the bot
   - Send ".ping" to trigger ping plugin

---

## Common Issues & Solutions

### 1. Bot Not Connected

**Symptoms:**
- No QR code displayed
- "WhatsApp Offline" error
- Connection keeps dropping

**Solutions:**

#### A. Check `.env` configuration
```env
BOT_MOCK_MODE=false          # Must be false for real WhatsApp
USE_PAIRING_CODE=true        # Or false for QR code
PAIRING_NUMBER=6283834946034 # Your WhatsApp number
```

#### B. Clear auth session and reconnect
```bash
# Stop the server
# Delete auth folder
rm -rf auth_info_baileys

# Restart server
npm start
```

#### C. Use QR Code instead of pairing
```env
USE_PAIRING_CODE=false
```
Then scan the QR code that appears in terminal.

---

### 2. Bot Connected But Not Responding

**Symptoms:**
- Bot shows as "Online"
- Messages sent but no reply
- Plugins not triggering

**Solutions:**

#### A. Check plugin triggers
Plugins only respond to specific triggers:

- **Ping Plugin**: Send `.ping`
- **Auto Reply**: Send `halo`, `test`, or `help`

#### B. Verify message handling
Check if messages are being received in logs:
```
[INFO] Message received from: 6283834946034
```

#### C. Test with API
```bash
curl -X POST http://localhost:3000/api/v1/otp/send \
  -H "Authorization: Bearer otp_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6283834946034",
    "message": "Test OTP: 1234",
    "code": "1234"
  }'
```

---

### 3. Scheduler Errors

**Symptoms:**
- `ERROR: Error processing scheduled messages`
- Scheduled OTPs not being sent

**Solutions:**

#### A. Check database
```bash
# Verify database file exists
ls database.wodb
```

#### B. Clear scheduled messages
The scheduler might have corrupt data. Restart the server to clear the queue.

#### C. Disable scheduler temporarily
Comment out scheduler initialization in `src/index.js`:
```javascript
// await schedulerService.init();
```

---

### 4. Rate Limiting Issues

**Symptoms:**
- "Rate limit exceeded" errors
- Messages not sending after many requests

**Solutions:**

#### A. Increase rate limits in `.env`
```env
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour window
RATE_LIMIT_MAX=1000           # Increase max requests
```

#### B. Clear rate limiter
Restart the server to reset rate limits.

---

## Testing Checklist

### ✅ Basic Tests

1. **Server Running**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```
   Expected: `{"status":"healthy"}`

2. **WhatsApp Connected**
   ```bash
   curl http://localhost:3000/api/v1/otp/status
   ```
   Expected: `{"connected":true}`

3. **Ping Plugin**
   - Send `.ping` to bot
   - Expected: Bot replies with "🏓 Pong! Latency: Xms"

4. **Auto Reply**
   - Send `test` to bot
   - Expected: "Test berhasil! Sistem WhatsApp active."

5. **API Send**
   ```bash
   curl -X POST http://localhost:3000/api/v1/otp/send \
     -H "Authorization: Bearer otp_test" \
     -H "Content-Type: application/json" \
     -d '{"phone":"6283834946034","message":"Test","code":"1234"}'
   ```

---

## Debug Mode

### Enable Detailed Logging

1. **Edit `.env`**
   ```env
   LOG_LEVEL=debug
   LOG_PRETTY=true
   ```

2. **Restart server**
   ```bash
   npm start
   ```

3. **Watch logs**
   - Look for message events
   - Check plugin execution
   - Monitor connection status

---

## Common Error Messages

### "WhatsApp Offline"
- **Cause**: Bot not connected to WhatsApp
- **Fix**: Reconnect using QR code or pairing code

### "Unauthorized"
- **Cause**: Invalid or missing API key/token
- **Fix**: Check Authorization header

### "Rate limit exceeded"
- **Cause**: Too many requests
- **Fix**: Wait or increase rate limits

### "Error processing scheduled messages"
- **Cause**: Database or scheduler issue
- **Fix**: Restart server or clear database

---

## Manual Testing Steps

### Test 1: Direct WhatsApp Message
1. Open WhatsApp on your phone
2. Send a message to the bot number
3. Send `.ping`
4. Expected: Bot replies immediately

### Test 2: API OTP Send
1. Get an API key from `/api/v1/keys`
2. Use the key to send OTP via API
3. Check if message is received on WhatsApp

### Test 3: Plugin Triggers
1. Send `halo` → Should get welcome message
2. Send `test` → Should get test confirmation
3. Send `help` → Should get help message
4. Send `.ping` → Should get pong response

---

## Still Not Working?

### Collect Debug Information

1. **Server logs** (last 50 lines)
2. **`.env` configuration** (hide sensitive data)
3. **WhatsApp connection status**
4. **Error messages**
5. **What you're trying to do**

### Check These Files

- `src/services/whatsapp.js` - WhatsApp connection logic
- `src/plugins/` - Plugin handlers
- `src/services/pluginManager.js` - Plugin loader
- `.env` - Configuration

---

## Quick Fixes

### Reset Everything
```bash
# Stop server (Ctrl+C)

# Clear auth
rm -rf auth_info_baileys

# Clear database (optional - will lose data!)
rm database.wodb

# Restart
npm start
```

### Force Reconnect
```bash
# Stop server
# Delete only auth
rm -rf auth_info_baileys

# Start server
npm start

# Scan QR code or use pairing code
```

---

## Contact & Support

If none of these solutions work:

1. Check server logs for specific errors
2. Verify WhatsApp number is correct
3. Ensure phone has internet connection
4. Try using QR code instead of pairing code
5. Check if WhatsApp Web is already active on another device

---

**Remember**: The bot only responds to:
- Messages with plugin triggers (`.ping`, `halo`, `test`, `help`)
- OTP messages sent via API

It does NOT respond to all messages automatically unless you create a plugin for that!
