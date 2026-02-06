module.exports = {
    name: 'PingPlugin',
    trigger: '.ping',
    async handler(sock, msg, text) {
        const jid = msg.key.remoteJid;
        const start = Date.now();
        await sock.sendMessage(jid, { text: 'Calculating latency...' });
        const latency = Date.now() - start;
        await sock.sendMessage(jid, { text: `🏓 *Pong!*\nLatency: ${latency}ms\nStatus: 🚀 High Performance` });
    }
};
