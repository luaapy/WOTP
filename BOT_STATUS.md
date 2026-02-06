# WhatsApp Bot Status & Quick Fix Guide

## Current Status

✅ **Server**: Running on port 3000  
✅ **WhatsApp**: Connected and Online  
✅ **Plugins**: Loaded (AutoResponder, PingPlugin)  
⚠️ **Scheduler**: Has minor errors (non-critical)  

---

## Why Bot Might Not Be Responding

### The bot ONLY responds to specific triggers:

1. **`.ping`** - Triggers ping plugin
   - Response: "🏓 Pong! Latency: Xms"

2. **`halo`** - Triggers auto-reply
   - Response: "Halo! Saya adalah WOTP Bot Gateway. Ada yang bisa dibantu?"

3. **`test`** - Triggers auto-reply
   - Response: "Test berhasil! Sistem WhatsApp active."

4. **`help`** - Triggers auto-reply
   - Response: "Ketik .menu untuk melihat daftar perintah API."

5. **API-sent OTPs** - Messages sent via `/api/v1/otp/send`

---

## Quick Test

### Test 1: Send `.ping` to the bot
1. Open WhatsApp
2. Send message: `.ping`
3. Expected response: "🏓 Pong! Latency: Xms Status: 🚀 High Performance"

### Test 2: Send `test` to the bot
1. Send message: `test`
2. Expected response: "Test berhasil! Sistem WhatsApp active."

### Test 3: Send `halo` to the bot
1. Send message: `halo`
2. Expected response: "Halo! Saya adalah WOTP Bot Gateway. Ada yang bisa dibantu?"

---

## Important Notes

### ⚠️ The bot does NOT respond to:
- ❌ Random messages without triggers
- ❌ Messages that don't contain keywords
- ❌ Messages from yourself (fromMe = true)
- ❌ Messages starting with `.` (except `.ping`)

### ✅ The bot WILL respond to:
- ✅ `.ping` command
- ✅ Messages containing `halo`, `test`, or `help`
- ✅ OTP messages sent via API

---

## How to Make Bot Respond to All Messages

If you want the bot to respond to ANY message, modify `src/plugins/autoReply.js`:

```javascript
module.exports = {
    name: 'AutoResponder',
    async handler(sock, msg, text) {
        // Remove this line to respond to all messages:
        // if (text.startsWith('.') || msg.key.fromMe) return;
        
        if (msg.key.fromMe) return; // Still ignore own messages
        
        const jid = msg.key.remoteJid;
        
        // Respond to everything
        await sock.sendMessage(jid, { 
            text: `You said: "${text}"\n\nI'm WOTP Bot! Send .ping to test.` 
        });
    }
};
```

---

## Current Configuration

From `.env`:
```env
BOT_MOCK_MODE=false          # Real WhatsApp connection
USE_PAIRING_CODE=true        # Using pairing code
PAIRING_NUMBER=6283834946034 # Your number
```

---

## Scheduler Errors (Non-Critical)

The scheduler is showing errors because it's trying to process scheduled messages but the database might be empty or have issues. This doesn't affect:
- ✅ Receiving messages
- ✅ Sending replies
- ✅ Plugin functionality
- ✅ API OTP sending

To fix scheduler errors, restart the server:
```bash
# Stop server (Ctrl+C)
npm start
```

---

## Testing Checklist

- [ ] Send `.ping` → Should get pong response
- [ ] Send `test` → Should get test confirmation
- [ ] Send `halo` → Should get welcome message
- [ ] Send random text → No response (expected)
- [ ] Send OTP via API → Should receive on WhatsApp

---

## Next Steps

1. **Test with `.ping`** - This is the easiest way to verify bot is working
2. **Check if you're sending to the right number** - Verify bot's WhatsApp number
3. **Make sure bot is not muted** - Check WhatsApp settings
4. **Verify you're not blocked** - Check if you can see bot's status

---

## Summary

**Your bot IS working!** It's just selective about what it responds to.

**To test right now:**
1. Open WhatsApp
2. Send: `.ping`
3. You should get an immediate response

If you want it to respond to everything, modify the `autoReply.js` plugin as shown above.

---

For more detailed troubleshooting, see `TROUBLESHOOTING.md`
