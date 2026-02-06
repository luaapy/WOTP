const db = require('../db/wodb');
const config = require('../config');

class RateLimiter {
    constructor() {
        // Map: tokenHash -> [timestamp1, timestamp2, ...]
        this.requests = new Map();
        this.windowMs = config.rateLimitWindowMs;
        this.limit = config.rateLimitMax;
    }

    async init() {
        const since = Date.now() - this.windowMs;
        const logs = await db.getLogs(since);
        
        // Rebuild memory state
        for (const log of logs) {
            // Only count 'otp_sent' actions for rate limiting
            if (log.tokenHash && log.timestamp && log.action === 'otp_sent') {
                if (!this.requests.has(log.tokenHash)) {
                    this.requests.set(log.tokenHash, []);
                }
                this.requests.get(log.tokenHash).push(log.timestamp);
            }
        }
        
        // Prune old
        for (const [key, timestamps] of this.requests.entries()) {
            const valid = timestamps.filter(t => t >= since).sort((a,b) => a-b);
            if (valid.length > 0) {
                this.requests.set(key, valid);
            } else {
                this.requests.delete(key);
            }
        }
        
        console.log(`RateLimiter initialized. Rebuilt state from ${logs.length} logs.`);
    }

    _prune(tokenHash) {
        if (!this.requests.has(tokenHash)) return;
        
        const now = Date.now();
        const timestamps = this.requests.get(tokenHash);
        const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
        
        if (validTimestamps.length === 0) {
            this.requests.delete(tokenHash);
        } else {
            this.requests.set(tokenHash, validTimestamps);
        }
    }

    isAllowed(tokenHash) {
        this._prune(tokenHash);
        
        const timestamps = this.requests.get(tokenHash) || [];
        return timestamps.length < this.limit;
    }

    // Call this AFTER sending successfully
    recordUsage(tokenHash) {
        // Update memory
        if (!this.requests.has(tokenHash)) {
            this.requests.set(tokenHash, []);
        }
        this.requests.get(tokenHash).push(Date.now());
        
        // Async log to DB (Fire and forget, or let caller await)
        // We return the promise so caller CAN await if they want, but usually we don't for speed
        return db.addLog({ tokenHash, action: 'otp_sent' }).catch(err => {
            console.error('Failed to log usage to DB:', err);
        });
    }
}

module.exports = new RateLimiter();
