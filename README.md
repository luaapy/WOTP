# 🚀 WOTP - WhatsApp OTP Enterprise Platform

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Enterprise-grade WhatsApp OTP delivery platform with advanced features**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## ✨ Features

### 🎯 Core Features
- **OTP Delivery via WhatsApp** - Send one-time passwords through WhatsApp
- **Multi-tenant Support** - API key-based authentication for multiple users
- **Template Management** - Customizable message templates with variables
- **Bulk Operations** - Send OTPs to multiple recipients at once
- **Scheduled Delivery** - Schedule OTPs for future delivery
- **Mock Mode** - Test without actual WhatsApp connection

### 📊 Analytics & Monitoring
- **Real-time Analytics** - Track delivery rates, success rates, and performance
- **Delivery Tracking** - Monitor message status (sent, delivered, read)
- **Health Monitoring** - System health checks and metrics
- **Audit Logging** - Complete activity tracking for compliance

### 🔒 Security & Reliability
- **API Key Authentication** - Secure token-based access control
- **Rate Limiting** - Prevent abuse with configurable limits
- **Retry Mechanism** - Automatic retry for failed messages
- **Error Handling** - Comprehensive error handling and logging

### 🛠️ Developer Experience
- **Swagger UI** - Interactive API documentation
- **RESTful API** - Clean, versioned API design
- **Webhook Support** - Real-time event notifications
- **Plugin System** - Extensible architecture

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd WOTP
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your settings
```

4. **Start the server**
```bash
npm start
```

5. **Access the API**
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs
- Health Check: http://localhost:3000/api/v1/health

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints (except health) require Bearer token authentication:
```bash
Authorization: Bearer wotp_your_api_key_here
```

### Endpoints Overview

#### 🔑 API Keys
- `GET /keys` - List all API keys
- `POST /keys` - Create new API key
- `DELETE /keys/:id` - Revoke API key

#### 📨 OTP Operations
- `POST /otp/send` - Send OTP
- `POST /otp/verify` - Verify OTP
- `GET /otp/status` - Check WhatsApp status

#### 📋 Templates
- `GET /templates` - List templates
- `POST /templates` - Create template
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

#### 📦 Bulk Operations
- `POST /bulk/send` - Send bulk OTPs
- `GET /bulk/status/:bulkId` - Check bulk status

#### ⏰ Scheduler
- `POST /scheduler/schedule` - Schedule OTP
- `GET /scheduler/list` - List scheduled
- `DELETE /scheduler/cancel/:id` - Cancel scheduled

#### 📊 Analytics
- `GET /analytics/dashboard` - Get dashboard data
- `GET /analytics/success-rate` - Success rate stats
- `GET /analytics/delivery-time` - Delivery time metrics
- `GET /analytics/top-phones` - Most used numbers

#### 🏥 Health
- `GET /health` - System health status
- `GET /health/metrics` - System metrics

---

## 💡 Usage Examples

### 1. Create API Key
```bash
curl -X POST http://localhost:3000/api/v1/keys \
  -H "Authorization: Bearer otp_your_legacy_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "permissions": ["otp:send", "otp:verify", "analytics:read"],
    "rateLimit": 1000
  }'
```

### 2. Send OTP
```bash
curl -X POST http://localhost:3000/api/v1/otp/send \
  -H "Authorization: Bearer wotp_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6283834946034",
    "message": "Your verification code is 123456",
    "code": "123456",
    "expiryMinutes": 5
  }'
```

### 3. Create Template
```bash
curl -X POST http://localhost:3000/api/v1/templates \
  -H "Authorization: Bearer wotp_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "welcome_otp",
    "name": "Welcome OTP",
    "content": "Welcome {{name}}! Your code is {{code}}. Valid for {{expiry}} minutes.",
    "language": "en",
    "variables": ["name", "code", "expiry"]
  }'
```

### 4. Send Bulk OTPs
```bash
curl -X POST http://localhost:3000/api/v1/bulk/send \
  -H "Authorization: Bearer wotp_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      {"phone": "6283834946034", "code": "1234", "name": "John"},
      {"phone": "6281234567890", "code": "5678", "name": "Jane"}
    ],
    "template": "Hello {{name}}, your code is {{code}}"
  }'
```

### 5. Schedule OTP
```bash
curl -X POST http://localhost:3000/api/v1/scheduler/schedule \
  -H "Authorization: Bearer wotp_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6283834946034",
    "message": "Your code is 1234",
    "code": "1234",
    "scheduledTime": "2026-02-07T10:00:00Z",
    "expiryMinutes": 5
  }'
```

### 6. Get Analytics Dashboard
```bash
curl -X GET "http://localhost:3000/api/v1/analytics/dashboard?days=7" \
  -H "Authorization: Bearer wotp_your_api_key"
```

---

## 🏗️ Architecture

### Project Structure
```
WOTP/
├── src/
│   ├── api/
│   │   └── v1/                    # API version 1 routes
│   │       ├── otp.routes.js
│   │       ├── analytics.routes.js
│   │       ├── templates.routes.js
│   │       ├── bulk.routes.js
│   │       ├── scheduler.routes.js
│   │       ├── health.routes.js
│   │       └── keys.routes.js
│   ├── controllers/               # Request handlers
│   │   ├── otpController.js
│   │   ├── analyticsController.js
│   │   ├── templateController.js
│   │   ├── bulkController.js
│   │   └── schedulerController.js
│   ├── repositories/              # Data access layer
│   │   ├── BaseRepository.js
│   │   ├── ApiKeyRepository.js
│   │   ├── TemplateRepository.js
│   │   ├── AnalyticsRepository.js
│   │   └── AuditLogRepository.js
│   ├── services/                  # Business logic
│   │   ├── whatsapp.js
│   │   ├── SchedulerService.js
│   │   ├── BulkService.js
│   │   ├── HealthService.js
│   │   ├── rateLimiter.js
│   │   ├── webhookService.js
│   │   └── pluginManager.js
│   ├── middleware/                # Express middleware
│   │   ├── auth.js
│   │   ├── validator.js
│   │   └── errorHandler.js
│   ├── validations/               # Request validation schemas
│   │   ├── otp.validation.js
│   │   ├── template.validation.js
│   │   ├── bulk.validation.js
│   │   └── scheduler.validation.js
│   ├── utils/                     # Utility functions
│   │   ├── logger.js
│   │   ├── phone.js
│   │   └── crypto.js
│   ├── db/                        # Database layer
│   │   └── wodb.js
│   ├── config.js                  # Configuration
│   └── index.js                   # Application entry point
├── tests/                         # Test files
├── public/                        # Static files
├── package.json
└── README.md
```

### Technology Stack
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **WhatsApp**: Baileys
- **Validation**: Joi
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI
- **Database**: Custom WODB (file-based)

### Design Patterns
- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic separation
- **Middleware Pattern** - Request/response processing
- **Factory Pattern** - Object creation
- **Singleton Pattern** - Service instances

---

## ⚙️ Configuration

### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Security
MASTER_PASSWORD=your_master_password
DB_MASTER_KEY=your_encryption_key

# Database
DB_PATH=database.wodb

# WhatsApp
BOT_MOCK_MODE=false
USE_PAIRING_CODE=true
PAIRING_NUMBER=6283834946034

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=100

# Webhooks
WEBHOOK_ENABLED=false
WEBHOOK_URL=https://your-webhook-url.com
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Mock Mode
Enable mock mode for testing without WhatsApp:
```env
BOT_MOCK_MODE=true
```

---

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T12:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "whatsapp": { "status": "healthy", "connected": true },
    "database": { "status": "healthy" },
    "memory": { "status": "healthy", "heapUsed": "45.23 MB" },
    "disk": { "status": "healthy" }
  }
}
```

### System Metrics
```bash
curl http://localhost:3000/api/v1/health/metrics
```

---

## 🔧 Development

### Adding New Features
1. Create repository in `src/repositories/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Create validation in `src/validations/`
5. Create routes in `src/api/v1/`
6. Register routes in `src/index.js`
7. Update Swagger documentation

### Code Style
- Use ES6+ features
- Follow async/await pattern
- Use meaningful variable names
- Add JSDoc comments
- Handle errors properly

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Express.js](https://expressjs.com/) - Web framework
- [Swagger](https://swagger.io/) - API documentation

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub

---

