# 🚀 Quick Start Guide - WOTP v3.0.0

## 5-Minute Setup

### Step 1: Start the Server ✅
The server is already running! You should see:
```
🚀 Enterprise Gateway Platform Ready
```

### Step 2: Access the Documentation 📚
Open your browser and visit:
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/api/v1/health

### Step 3: Create Your First API Key 🔑

Using your existing legacy token, create a new API key:

```bash
curl -X POST http://localhost:3000/api/v1/keys \
  -H "Authorization: Bearer otp_your_legacy_token" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"My First API Key\", \"rateLimit\": 1000}"
```

**Save the returned API key!** It starts with `wotp_` and will only be shown once.

### Step 4: Test the New Features 🎯

#### A. Send a Simple OTP
```bash
curl -X POST http://localhost:3000/api/v1/otp/send \
  -H "Authorization: Bearer wotp_YOUR_NEW_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"6283834946034\", \"message\": \"Your code is 1234\", \"code\": \"1234\"}"
```

#### B. Create a Template
```bash
curl -X POST http://localhost:3000/api/v1/templates \
  -H "Authorization: Bearer wotp_YOUR_NEW_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"welcome\", \"name\": \"Welcome Template\", \"content\": \"Welcome {{name}}! Your OTP is {{code}}. Valid for {{expiry}} minutes.\", \"variables\": [\"name\", \"code\", \"expiry\"]}"
```

#### C. View Analytics Dashboard
```bash
curl http://localhost:3000/api/v1/analytics/dashboard?days=7 \
  -H "Authorization: Bearer wotp_YOUR_NEW_KEY"
```

#### D. Check System Health
```bash
curl http://localhost:3000/api/v1/health
```

---

## 🎮 Interactive Testing with Swagger

1. Go to http://localhost:3000/docs
2. Click **"Authorize"** button at the top
3. Enter your API key: `Bearer wotp_YOUR_KEY`
4. Click **"Authorize"** then **"Close"**
5. Now you can test all endpoints interactively!

---

## 📊 Explore New Features

### 1. Templates
Create reusable message templates with variables:
- Navigate to `/api/v1/templates` in Swagger
- Click **POST /api/v1/templates**
- Try it out with your own template

### 2. Bulk Operations
Send OTPs to multiple people at once:
- Navigate to `/api/v1/bulk/send`
- Send to 2-3 test numbers
- Check status with `/api/v1/bulk/status/{bulkId}`

### 3. Scheduler
Schedule an OTP for future delivery:
- Navigate to `/api/v1/scheduler/schedule`
- Set `scheduledTime` to 5 minutes from now
- Watch it get delivered automatically!

### 4. Analytics
View your OTP delivery statistics:
- Navigate to `/api/v1/analytics/dashboard`
- See success rates, delivery times, and trends

---

## 🔥 Common Use Cases

### Use Case 1: User Registration Flow
```javascript
// 1. Send OTP
POST /api/v1/otp/send
{
  "phone": "6283834946034",
  "message": "Your verification code is 1234",
  "code": "1234",
  "expiryMinutes": 5
}

// 2. User enters code
// 3. Verify OTP
POST /api/v1/otp/verify
{
  "phone": "6283834946034",
  "code": "1234"
}
```

### Use Case 2: Bulk User Verification
```javascript
POST /api/v1/bulk/send
{
  "recipients": [
    {"phone": "6283834946034", "code": "1234", "name": "John"},
    {"phone": "6281234567890", "code": "5678", "name": "Jane"}
  ],
  "template": "Hi {{name}}! Your code is {{code}}"
}
```

### Use Case 3: Scheduled Password Reset
```javascript
POST /api/v1/scheduler/schedule
{
  "phone": "6283834946034",
  "message": "Your password reset code is 9876",
  "code": "9876",
  "scheduledTime": "2026-02-07T09:00:00Z"
}
```

---

## 📱 Testing with Postman

### Import Collection
Create a new Postman collection with these endpoints:

1. **Environment Variables**
   - `base_url`: `http://localhost:3000`
   - `api_key`: `wotp_YOUR_KEY`

2. **Headers** (for all requests)
   - `Authorization`: `Bearer {{api_key}}`
   - `Content-Type`: `application/json`

3. **Sample Requests**
   - Send OTP: `POST {{base_url}}/api/v1/otp/send`
   - Create Template: `POST {{base_url}}/api/v1/templates`
   - Bulk Send: `POST {{base_url}}/api/v1/bulk/send`
   - Analytics: `GET {{base_url}}/api/v1/analytics/dashboard`

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart
node src/index.js
```

### WhatsApp Not Connected
- Check if `BOT_MOCK_MODE=false` in `.env`
- Scan QR code or use pairing code
- Check logs for connection errors

### API Key Not Working
- Make sure you're using `Bearer wotp_...` format
- Check if key is active: `GET /api/v1/keys`
- Verify you saved the full key when created

### Rate Limit Exceeded
- Wait for the rate limit window to reset
- Check your key's rate limit: `GET /api/v1/keys`
- Increase rate limit when creating new keys

---

## 📖 Next Steps

1. **Read the Full Documentation**
   - `README.md` - Complete project overview
   - `API_DOCUMENTATION.md` - Detailed API reference
   - `UPGRADE_SUMMARY.md` - All new features

2. **Explore Advanced Features**
   - Set up webhooks for real-time notifications
   - Create custom templates for different use cases
   - Monitor analytics for insights

3. **Customize Configuration**
   - Edit `.env` file for your needs
   - Adjust rate limits
   - Configure webhooks

4. **Production Deployment**
   - Use strong `MASTER_PASSWORD` and `DB_MASTER_KEY`
   - Set up HTTPS
   - Configure proper logging
   - Set up monitoring

---

## 🎉 You're All Set!

Your WOTP platform is now running with:
- ✅ Multi-tenant API keys
- ✅ Template management
- ✅ Bulk operations
- ✅ Scheduler system
- ✅ Analytics & reporting
- ✅ Health monitoring
- ✅ Audit logging

**Happy coding! 🚀**

---

## 💡 Pro Tips

1. **Use Templates** - Create templates for common messages to save time
2. **Monitor Analytics** - Check your dashboard regularly for insights
3. **Schedule Wisely** - Use scheduler for non-urgent OTPs to reduce load
4. **Bulk Carefully** - Test with small batches before sending to thousands
5. **Check Health** - Monitor `/api/v1/health` to ensure system is running well

---

## 📞 Need Help?

- Check Swagger UI: http://localhost:3000/docs
- Review API docs: `API_DOCUMENTATION.md`
- Check logs in console
- Review error messages in responses

---

**Made with ❤️ - Enjoy your upgraded platform!**
