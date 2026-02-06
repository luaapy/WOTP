module.exports = {
    name: 'ping',
    category: 'general',
    description: 'Check bot latency and response time',
    usage: '|ping',
    aliases: ['pong', 'latency'],

    async execute(sock, msg, args, jid) {
        const start = Date.now();

        const sentMsg = await sock.sendMessage(jid, {
            text: '🏓 Calculating latency...'
        });

        const latency = Date.now() - start;

        const responseText = `🏓 *Pong!*

⚡ *Latency:* ${latency}ms
📊 *Status:* ${latency < 100 ? '🟢 Excellent' : latency < 300 ? '🟡 Good' : '🔴 Slow'}
🤖 *Bot:* Online
⏱️ *Uptime:* ${formatUptime(process.uptime())}
💾 *Memory:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;

        await sock.sendMessage(jid, { text: responseText });
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
}
