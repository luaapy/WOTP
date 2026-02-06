const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    proto
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('../config');
const { normalizePhone } = require('../utils/phone');
const db = require('../db/wodb');
const logger = require('../utils/logger');
const webhook = require('./webhookService');
const plugins = require('./pluginManager');
const pino = require('pino');

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
    }

    async init() {
        if (config.mockMode) {
            logger.info('🤖 MOCK MODE Enabled');
            this.isConnected = true;
            return;
        }

        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            auth: state,
            browser: Browsers.macOS('Desktop'),
        });

        await plugins.loadPlugins(this.sock);
        this.bindEvents(saveCreds);
    }

    bindEvents(saveCreds) {
        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) qrcode.generate(qr, { small: true });

            if (connection === 'close') {
                this.isConnected = false;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) setTimeout(() => this.init(), 5000);
            } else if (connection === 'open') {
                this.isConnected = true;
                logger.info('✅ WhatsApp Online');
            }
        });

        // NEW: Delivery Status Tracking
        this.sock.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                if (update.update.status) {
                    const statusMap = {
                        [proto.WebMessageInfo.Status.ERROR]: 'ERROR',
                        [proto.WebMessageInfo.Status.PENDING]: 'PENDING',
                        [proto.WebMessageInfo.Status.SERVER_ACK]: 'SENT',
                        [proto.WebMessageInfo.Status.DELIVERY_ACK]: 'DELIVERED',
                        [proto.WebMessageInfo.Status.READ]: 'READ',
                        [proto.WebMessageInfo.Status.PLAYED]: 'PLAYED'
                    };

                    const status = statusMap[update.update.status];
                    logger.info({ msgId: update.key.id, status }, 'Message status updated');

                    // Notify Webhook
                    await webhook.notify('message.status', {
                        messageId: update.key.id,
                        phone: update.key.remoteJid,
                        status: status,
                        timestamp: new Date()
                    });
                }
            }
        });

        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message) return;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            await plugins.handleMessage(this.sock, msg, text);
        });
    }

    async sendOTP(phone, message) {
        const jid = normalizePhone(phone);
        if (!this.isConnected) throw new Error('WhatsApp Offline');
        const result = await this.sock.sendMessage(jid, { text: message });
        return { success: true, messageId: result.key.id };
    }

    getStatus() {
        return { connected: this.isConnected, uptime: process.uptime() };
    }
}

module.exports = new WhatsAppService();
