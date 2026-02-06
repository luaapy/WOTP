const fs = require('fs').promises;
const crypto = require('crypto');
const config = require('../config');

class Mutex {
    constructor() {
        this._queue = Promise.resolve();
    }

    lock() {
        let release;
        const next = new Promise(resolve => release = resolve);
        const previous = this._queue;
        this._queue = this._queue.then(() => next);
        return previous.then(() => release);
    }
}

class WODB {
    constructor() {
        this.filePath = config.dbPath;
        this.key = crypto.scryptSync(config.dbMasterKey, 'salt', 32); // Simple salt for now, ideally random but needs storage
        this.mutex = new Mutex();
        this.data = { tokens: [], logs: [] };
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            await fs.access(this.filePath);
            // File exists, read it
            const encryptedBuffer = await fs.readFile(this.filePath);
            if (encryptedBuffer.length > 0) {
                this.data = this.decrypt(encryptedBuffer);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, create it with empty data
                await this.save();
            } else {
                throw error;
            }
        }
        this.initialized = true;
    }

    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
        let encrypted = cipher.update(JSON.stringify(data));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    }

    decrypt(buffer) {
        const iv = buffer.slice(0, 16);
        const encryptedText = buffer.slice(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
    }

    // Save current memory state to disk
    async save() {
        const buffer = this.encrypt(this.data);
        await fs.writeFile(this.filePath, buffer);
    }

    // Execute a write operation with Mutex
    async performWrite(operation) {
        const release = await this.mutex.lock();
        try {
            // Ensure we have latest data (in case another process modified it? 
            // Since we are single process nodejs, memory is source of truth, 
            // but if we crash we recover from file.
            // For now, we assume this process owns the DB exclusively as per "write queue within application" requirement).
            await operation();
            await this.save();
        } finally {
            release();
        }
    }

    async addToken(tokenHash) {
        await this.performWrite(() => {
            this.data.tokens.push({ hash: tokenHash, created_at: Date.now() });
        });
    }

    async addLog(logEntry) {
        await this.performWrite(() => {
            this.data.logs.push({ ...logEntry, timestamp: Date.now() });
        });
    }

    async getTokens() {
        return this.data.tokens;
    }

    async getLogs(since = 0) {
        if (!since) return this.data.logs;
        return this.data.logs.filter(log => log.timestamp >= since);
    }
}

// Singleton instance
const db = new WODB();

module.exports = db;
