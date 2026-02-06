const db = require('../db/wodb');

module.exports = {
    name: 'searchotp',
    category: 'otp',
    description: 'Search OTPs by phone number or code',
    usage: '|searchotp <phone|code>',
    aliases: ['findotp', 'search'],
    examples: ['|searchotp 628383', '|searchotp 123456'],

    async execute(sock, msg, args, jid) {
        if (args.length === 0) {
            await sock.sendMessage(jid, {
                text: `❌ *Invalid Usage!*

*Usage:* |searchotp <phone|code>

*Examples:*
|searchotp 628383
|searchotp 123456

Search by phone number or OTP code.`
            });
            return;
        }

        const query = args[0];

        try {
            const allOtps = await db.findAll('otps', {});

            // Search by phone or code
            const results = allOtps.filter(otp =>
                otp.phone.includes(query) || otp.code.includes(query)
            );

            if (results.length === 0) {
                await sock.sendMessage(jid, {
                    text: `❌ *NO RESULTS FOUND!*\n\nQuery: ${query}\n\nNo OTPs match your search.`
                });
                return;
            }

            // Sort by date (newest first)
            const sortedResults = results
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);

            let responseText = `🔍 *SEARCH RESULTS* (${sortedResults.length}/${results.length})\n\nQuery: "${query}"\n\n`;

            sortedResults.forEach((otp, index) => {
                const now = new Date();
                const expiresAt = new Date(otp.expiresAt);
                const isExpired = now > expiresAt;
                const status = isExpired && otp.status !== 'verified' ? 'expired' : otp.status;

                responseText += `${index + 1}. 📱 +${otp.phone}\n`;
                responseText += `   🔐 Code: ${otp.code}\n`;
                responseText += `   📊 Status: ${status.toUpperCase()}\n`;
                responseText += `   📅 ${new Date(otp.createdAt).toLocaleString()}\n\n`;
            });

            if (results.length > 10) {
                responseText += `\n... and ${results.length - 10} more results.`;
            }

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Search Error!*\n\nError: ${error.message}`
            });
        }
    }
};
