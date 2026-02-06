require('dotenv').config();

module.exports = {
  // Server Config
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // Auth & Security
  masterPassword: process.env.MASTER_PASSWORD || 'admin',
  dbMasterKey: process.env.DB_MASTER_KEY || 'default-secret-key-do-not-use-in-prod',

  // Database
  dbPath: process.env.DB_PATH || 'database.wodb',

  // WhatsApp
  mockMode: process.env.BOT_MOCK_MODE === 'true',
  usePairingCode: process.env.USE_PAIRING_CODE === 'true',
  pairingNumber: process.env.PAIRING_NUMBER || '6283834946034',

  // Rate Limiting
  rateLimitWindowMs: 60 * 60 * 1000, // 1 hour
  rateLimitMax: 100,

  // Webhook (NEW)
  webhookEnabled: process.env.WEBHOOK_ENABLED === 'true' || false,
  webhookUrl: process.env.WEBHOOK_URL || '',
};
