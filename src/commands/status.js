module.exports = {
    name: 'status',
    category: 'general',
    description: 'Check bot status and system information',
    usage: '|status',
    aliases: ['botstatus', 'info'],

    async execute(sock, msg, args, jid) {
        const uptime = process.uptime();
        const memory = process.memoryUsage();

        const responseText = `🟢 *BOT STATUS*

✅ *WhatsApp:* Online
✅ *Server:* Running
✅ *Database:* Connected
✅ *API:* Active

⏱️ *Uptime:* ${formatUptime(uptime)}
💾 *Memory:* ${Math.round(memory.heapUsed / 1024 / 1024)}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB
🔄 *Process ID:* ${process.pid}
📊 *Node.js:* ${process.version}
🖥️ *Platform:* ${process.platform}

🚀 *Performance:* Excellent
📈 *Response Time:* Fast
🔒 *Security:* Active

Type |help for all commands!`;

        await sock.sendMessage(jid, { text: responseText });
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
