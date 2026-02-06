module.exports = {
    name: 'calc',
    category: 'utility',
    description: 'Calculate mathematical expressions',
    usage: '|calc [expression]',
    aliases: ['calculate', 'math'],
    examples: ['|calc 2+2', '|calc 10*5', '|calc 100/4'],

    async execute(sock, msg, args, jid) {
        if (args.length === 0) {
            await sock.sendMessage(jid, {
                text: '❌ Please provide an expression!\n\nUsage: |calc 2+2\n\nSupports: +, -, *, /, ^, sqrt(), sin(), cos()'
            });
            return;
        }

        const expression = args.join(' ');

        try {
            // Sanitize expression (remove dangerous characters)
            const sanitized = expression.replace(/[^0-9+\-*/().sqrt sincotan ]/g, '');

            // Simple evaluation (for basic operations)
            let result;

            if (sanitized.includes('sqrt')) {
                const num = parseFloat(sanitized.replace('sqrt', '').replace(/[()]/g, ''));
                result = Math.sqrt(num);
            } else if (sanitized.includes('sin')) {
                const num = parseFloat(sanitized.replace('sin', '').replace(/[()]/g, ''));
                result = Math.sin(num * Math.PI / 180);
            } else if (sanitized.includes('cos')) {
                const num = parseFloat(sanitized.replace('cos', '').replace(/[()]/g, ''));
                result = Math.cos(num * Math.PI / 180);
            } else {
                // Use Function constructor for safe evaluation
                result = Function('"use strict"; return (' + sanitized + ')')();
            }

            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid result');
            }

            const responseText = `🔢 *Calculator*

📝 *Expression:* ${expression}
✅ *Result:* ${result}

${result % 1 === 0 ? '🎯 Integer result!' : '📊 Decimal result'}`;

            await sock.sendMessage(jid, { text: responseText });

        } catch (error) {
            await sock.sendMessage(jid, {
                text: `❌ *Calculation Error!*\n\nExpression: ${expression}\nError: Invalid expression\n\nPlease check your syntax and try again.`
            });
        }
    }
};
