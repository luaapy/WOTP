# WOTP Bot - Working Commands Documentation

## ✅ All Commands Are Fully Functional

This bot has **13 working commands** specifically designed for OTP management via WhatsApp.

---

## 📱 OTP Commands (8)

### 1. |sendotp
**Send OTP to a phone number**

```
Usage: |sendotp <phone> <code> [custom_message]

Examples:
|sendotp 6283834946034 123456
|sendotp 6283834946034 123456 Your verification code is

Parameters:
- phone: Phone number with country code (10-15 digits)
- code: OTP code (4-8 digits)
- custom_message: Optional custom message prefix
```

**What it does:**
- Sends OTP via WhatsApp
- Saves to database with expiry (5 minutes)
- Returns OTP ID for tracking
- Validates phone number and code format

---

### 2. |verifyotp
**Verify an OTP code**

```
Usage: |verifyotp <phone> <code>

Example:
|verifyotp 6283834946034 123456

Parameters:
- phone: Phone number with country code
- code: OTP code to verify
```

**What it does:**
- Checks if OTP exists in database
- Validates expiry time
- Marks OTP as verified
- Shows verification status and time left

---

### 3. |resendotp
**Resend the last OTP to a phone number**

```
Usage: |resendotp <phone>

Example:
|resendotp 6283834946034

Parameters:
- phone: Phone number with country code
```

**What it does:**
- Finds the last OTP sent to the phone
- Resends the same OTP code
- Updates resent count
- Tracks resend history

---

### 4. |otpstatus
**Check OTP delivery and verification status**

```
Usage: |otpstatus <otp_id>

Example:
|otpstatus abc123-def456

Parameters:
- otp_id: The OTP ID from sendotp response
```

**What it does:**
- Shows detailed OTP information
- Displays status (sent/delivered/verified/expired)
- Shows time remaining
- Verification timestamp if verified

---

### 5. |listotps
**List recent OTPs**

```
Usage: |listotps [limit]

Examples:
|listotps
|listotps 20

Parameters:
- limit: Number of OTPs to show (1-50, default: 10)
```

**What it does:**
- Lists recent OTPs sorted by date
- Shows phone, code, status for each
- Displays creation time
- Shows OTP ID for each entry

---

### 6. |searchotp
**Search OTPs by phone number or code**

```
Usage: |searchotp <query>

Examples:
|searchotp 628383
|searchotp 123456

Parameters:
- query: Phone number or OTP code to search
```

**What it does:**
- Searches database for matching OTPs
- Supports partial phone number search
- Supports partial code search
- Shows up to 10 results

---

### 7. |deleteotp
**Delete an OTP record**

```
Usage: |deleteotp <otp_id>

Example:
|deleteotp abc123-def456

Parameters:
- otp_id: The OTP ID to delete
```

**What it does:**
- Permanently deletes OTP from database
- Shows deleted OTP details
- Cannot be undone
- Useful for cleanup

---

### 8. |clearotps
**Clear all expired OTPs**

```
Usage: |clearotps

Example:
|clearotps
```

**What it does:**
- Finds all expired OTPs
- Deletes expired OTPs (except verified ones)
- Shows count of deleted OTPs
- Keeps verified OTPs for records

---

## 📊 Statistics (1)

### 9. |otpstats
**View OTP statistics and analytics**

```
Usage: |otpstats [days]

Examples:
|otpstats
|otpstats 7
|otpstats 30

Parameters:
- days: Number of days to analyze (1-365, default: 30)
```

**What it does:**
- Calculates total OTPs sent
- Shows verified count and percentage
- Displays pending and expired counts
- Shows unique phone numbers
- Calculates average per day
- Shows success rate

---

## ⚙️ System Commands (4)

### 10. |help
**Show help menu or command details**

```
Usage: |help [command]

Examples:
|help
|help sendotp
|help verifyotp

Parameters:
- command: Optional command name for detailed help
```

**What it does:**
- Shows main help menu with all commands
- Shows detailed help for specific command
- Displays usage examples
- Lists command aliases

---

### 11. |ping
**Check bot latency and status**

```
Usage: |ping

Example:
|ping
```

**What it does:**
- Measures response latency
- Shows bot status (online/offline)
- Displays uptime
- Shows memory usage
- Performance indicator

---

### 12. |status
**Check bot and system status**

```
Usage: |status

Example:
|status
```

**What it does:**
- Shows WhatsApp connection status
- Displays server status
- Shows database status
- Displays API status
- Shows uptime and memory
- Platform and Node.js version

---

### 13. |calc
**Calculate mathematical expressions**

```
Usage: |calc <expression>

Examples:
|calc 2+2
|calc 10*5
|calc 100/4
|calc sqrt(16)

Parameters:
- expression: Mathematical expression to calculate
```

**What it does:**
- Evaluates mathematical expressions
- Supports: +, -, *, /, sqrt(), sin(), cos()
- Shows result with validation
- Safe evaluation (no code injection)

---

## 🎯 Usage Tips

1. **All commands start with `|` prefix**
   - Example: `|help`, `|sendotp`, `|ping`

2. **Phone number format**
   - Use country code without + or spaces
   - Example: `6283834946034` (Indonesia)
   - Example: `14155552671` (USA)

3. **OTP code format**
   - 4-8 digits only
   - Example: `123456`, `1234`, `12345678`

4. **Case insensitive**
   - `|HELP`, `|help`, `|Help` all work the same

5. **Get OTP ID**
   - Save the OTP ID from `|sendotp` response
   - Use it with `|otpstatus` and `|deleteotp`

---

## 📖 Common Workflows

### Workflow 1: Send and Verify OTP
```
1. |sendotp 6283834946034 123456
   → Bot sends OTP and returns OTP ID

2. User receives OTP on WhatsApp

3. |verifyotp 6283834946034 123456
   → Bot verifies and confirms
```

### Workflow 2: Resend OTP
```
1. User didn't receive OTP

2. |resendotp 6283834946034
   → Bot resends the same OTP code
```

### Workflow 3: Check Status
```
1. |otpstatus abc123-def456
   → Shows detailed OTP status

2. |listotps 10
   → Shows recent 10 OTPs

3. |otpstats 7
   → Shows statistics for last 7 days
```

### Workflow 4: Cleanup
```
1. |clearotps
   → Removes all expired OTPs

2. |deleteotp abc123-def456
   → Deletes specific OTP
```

---

## 🔗 Integration with API

All bot commands work alongside the REST API:

- **Bot Commands**: For manual OTP management via WhatsApp
- **REST API**: For automated OTP sending from applications

Both use the same database and OTP records.

**API Documentation**: http://localhost:3000/docs

---

## ✅ All Commands Are Production-Ready

Every command listed here:
- ✅ Is fully implemented
- ✅ Has error handling
- ✅ Validates input
- ✅ Works with the database
- ✅ Provides clear feedback
- ✅ Is tested and functional

**No placeholder or dummy commands!**

---

## 📞 Support

- **Email**: admin@wotp-gateway.pro
- **API Docs**: http://localhost:3000/docs
- **Bot Help**: Type `|help` in WhatsApp

---

**Total: 13 Fully Functional Commands** 🚀
