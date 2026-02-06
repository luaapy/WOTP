# 📖 API Documentation

## Table of Contents
- [Authentication](#authentication)
- [API Keys](#api-keys)
- [OTP Operations](#otp-operations)
- [Templates](#templates)
- [Bulk Operations](#bulk-operations)
- [Scheduler](#scheduler)
- [Analytics](#analytics)
- [Health](#health)
- [Error Handling](#error-handling)

---

## Authentication

All API endpoints (except health checks) require authentication using Bearer tokens.

### Headers
```
Authorization: Bearer <your_api_key>
Content-Type: application/json
```

### Token Formats
- **New API Keys**: `wotp_<64_hex_characters>`
- **Legacy Tokens**: `otp_<random_string>`

---

## API Keys

### Create API Key
**POST** `/api/v1/keys`

Create a new API key for authentication.

**Request Body:**
```json
{
  "name": "Production API Key",
  "permissions": ["otp:send", "otp:verify", "analytics:read"],
  "rateLimit": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key created. Save this key securely - it will not be shown again.",
  "data": {
    "id": "api_keys_1234567890_abc123",
    "name": "Production API Key",
    "key": "wotp_abc123def456...",
    "permissions": ["otp:send", "otp:verify", "analytics:read"],
    "rateLimit": 1000
  }
}
```

### List API Keys
**GET** `/api/v1/keys`

Get all API keys for the current user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "api_keys_1234567890_abc123",
      "name": "Production API Key",
      "keyPreview": "wotp_...abc12345",
      "permissions": ["otp:send", "otp:verify"],
      "rateLimit": 1000,
      "usageCount": 1523,
      "lastUsed": "2026-02-06T12:00:00.000Z",
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

### Revoke API Key
**DELETE** `/api/v1/keys/:id`

Revoke an API key.

**Response:**
```json
{
  "success": true,
  "message": "API key revoked"
}
```

---

## OTP Operations

### Send OTP
**POST** `/api/v1/otp/send`

Send an OTP via WhatsApp.

**Request Body:**
```json
{
  "phone": "6283834946034",
  "message": "Your verification code is 123456",
  "code": "123456",
  "expiryMinutes": 5
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "3EB0C1234567890ABCDEF",
  "phone": "6283834946034@s.whatsapp.net"
}
```

### Verify OTP
**POST** `/api/v1/otp/verify`

Verify an OTP code.

**Request Body:**
```json
{
  "phone": "6283834946034",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "OTP verified successfully"
}
```

### Get Status
**GET** `/api/v1/otp/status`

Check WhatsApp connection status.

**Response:**
```json
{
  "success": true,
  "connected": true,
  "uptime": 3600
}
```

---

## Templates

### List Templates
**GET** `/api/v1/templates`

Get all active templates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "templates_1234567890_abc123",
      "code": "welcome_otp",
      "name": "Welcome OTP Template",
      "content": "Welcome {{name}}! Your code is {{code}}. Valid for {{expiry}} minutes.",
      "language": "en",
      "variables": ["name", "code", "expiry"],
      "usageCount": 245,
      "isActive": true
    }
  ]
}
```

### Create Template
**POST** `/api/v1/templates`

Create a new message template.

**Request Body:**
```json
{
  "code": "welcome_otp",
  "name": "Welcome OTP Template",
  "content": "Welcome {{name}}! Your code is {{code}}. Valid for {{expiry}} minutes.",
  "language": "en",
  "variables": ["name", "code", "expiry"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "templates_1234567890_abc123",
    "code": "welcome_otp",
    "name": "Welcome OTP Template",
    "content": "Welcome {{name}}! Your code is {{code}}. Valid for {{expiry}} minutes.",
    "language": "en",
    "variables": ["name", "code", "expiry"],
    "isActive": true,
    "usageCount": 0
  }
}
```

### Update Template
**PUT** `/api/v1/templates/:id`

Update an existing template.

**Request Body:**
```json
{
  "name": "Updated Welcome Template",
  "content": "Hi {{name}}! Your verification code is {{code}}.",
  "isActive": true
}
```

### Delete Template
**DELETE** `/api/v1/templates/:id`

Delete a template.

---

## Bulk Operations

### Send Bulk OTPs
**POST** `/api/v1/bulk/send`

Send OTPs to multiple recipients.

**Request Body:**
```json
{
  "recipients": [
    {
      "phone": "6283834946034",
      "code": "1234",
      "name": "John Doe"
    },
    {
      "phone": "6281234567890",
      "code": "5678",
      "name": "Jane Smith"
    }
  ],
  "template": "Hello {{name}}, your verification code is {{code}}",
  "metadata": {
    "campaign": "user_verification"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk operation started",
  "data": {
    "bulkId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "total": 2
  }
}
```

### Get Bulk Status
**GET** `/api/v1/bulk/status/:bulkId`

Check the status of a bulk operation.

**Response:**
```json
{
  "success": true,
  "data": {
    "bulkId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "total": 2,
    "processed": 2,
    "successful": 2,
    "failed": 0,
    "progress": "100.00",
    "createdAt": "2026-02-06T12:00:00.000Z",
    "completedAt": "2026-02-06T12:01:30.000Z"
  }
}
```

---

## Scheduler

### Schedule OTP
**POST** `/api/v1/scheduler/schedule`

Schedule an OTP for future delivery.

**Request Body:**
```json
{
  "phone": "6283834946034",
  "message": "Your verification code is 1234",
  "code": "1234",
  "scheduledTime": "2026-02-07T10:00:00Z",
  "expiryMinutes": 5,
  "maxAttempts": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP scheduled successfully",
  "data": {
    "id": "scheduled_messages_1234567890_abc123",
    "phone": "6283834946034",
    "scheduledTime": "2026-02-07T10:00:00.000Z",
    "status": "pending"
  }
}
```

### List Scheduled
**GET** `/api/v1/scheduler/list`

Get all scheduled messages.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "scheduled_messages_1234567890_abc123",
      "phone": "6283834946034",
      "message": "Your verification code is 1234",
      "scheduledTime": "2026-02-07T10:00:00.000Z",
      "status": "pending",
      "attempts": 0,
      "maxAttempts": 3
    }
  ]
}
```

### Cancel Scheduled
**DELETE** `/api/v1/scheduler/cancel/:id`

Cancel a scheduled message.

---

## Analytics

### Dashboard
**GET** `/api/v1/analytics/dashboard?days=7`

Get comprehensive analytics dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyStats": [
      {
        "date": "2026-02-06",
        "total": 150,
        "successful": 145,
        "failed": 5
      }
    ],
    "topPhones": [
      {
        "phone": "6283834946034",
        "count": 25
      }
    ],
    "successRate": {
      "total": 1050,
      "successful": 1020,
      "failed": 30,
      "successRate": "97.14"
    },
    "averageDeliveryTime": "2.34s",
    "period": "7 days"
  }
}
```

### Success Rate
**GET** `/api/v1/analytics/success-rate?startDate=2026-02-01&endDate=2026-02-07`

Get OTP success rate statistics.

### Delivery Time
**GET** `/api/v1/analytics/delivery-time`

Get average delivery time metrics.

### Top Phones
**GET** `/api/v1/analytics/top-phones?limit=10`

Get most frequently used phone numbers.

---

## Health

### Health Check
**GET** `/api/v1/health`

Get system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T12:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "whatsapp": {
      "status": "healthy",
      "connected": true,
      "uptime": 3600
    },
    "database": {
      "status": "healthy",
      "message": "Database accessible"
    },
    "memory": {
      "status": "healthy",
      "heapUsed": "45.23 MB",
      "heapTotal": "89.45 MB",
      "systemUsed": "65.34%"
    }
  }
}
```

### System Metrics
**GET** `/api/v1/health/metrics`

Get detailed system metrics.

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `202` - Accepted (async operations)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `WHATSAPP_OFFLINE` - WhatsApp not connected
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

Rate limits are enforced per API key:
- Default: 100 requests per hour
- Configurable per API key
- Headers returned:
  - `X-RateLimit-Limit` - Request limit
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Reset timestamp

---

## Webhooks

Configure webhooks to receive real-time event notifications:

### Events
- `message.sent` - Message sent to WhatsApp
- `message.delivered` - Message delivered
- `message.read` - Message read by recipient
- `message.failed` - Message delivery failed

### Webhook Payload
```json
{
  "event": "message.delivered",
  "timestamp": "2026-02-06T12:00:00.000Z",
  "data": {
    "messageId": "3EB0C1234567890ABCDEF",
    "phone": "6283834946034@s.whatsapp.net",
    "status": "delivered"
  }
}
```
