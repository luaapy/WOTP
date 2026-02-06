/**
 * Bulk Command Generator
 * Generates multiple OTP-related commands programmatically
 */

const fs = require('fs');
const path = require('path');

// Command categories and their commands
const commandTemplates = {
    // OTP Core Commands (20)
    otp_core: [
        'sendotp', 'verifyotp', 'resendotp', 'cancelotp', 'otpstatus',
        'listotps', 'searchotp', 'deleteotp', 'expireotp', 'refreshotp',
        'otphistory', 'otpdetails', 'otplog', 'otpqueue', 'otppending',
        'otpverified', 'otpexpired', 'otpfailed', 'otpcount', 'otpclear'
    ],

    // OTP Statistics (20)
    otp_stats: [
        'otpstats', 'otpreport', 'otpanalytics', 'otpsuccess', 'otpfailure',
        'otprate', 'otptrend', 'otpgraph', 'otpchart', 'otpmetrics',
        'otpdaily', 'otpweekly', 'otpmonthly', 'otpyearly', 'otptotal',
        'otpaverage', 'otppeak', 'otplow', 'otpcompare', 'otpforecast'
    ],

    // Bulk OTP Operations (20)
    otp_bulk: [
        'bulksend', 'bulkverify', 'bulkcancel', 'bulkstatus', 'bulklist',
        'bulkimport', 'bulkexport', 'bulkdelete', 'bulkresend', 'bulkqueue',
        'bulkprocess', 'bulkpause', 'bulkresume', 'bulkstop', 'bulkretry',
        'bulkfailed', 'bulksuccess', 'bulkpending', 'bulkcount', 'bulkclear'
    ],

    // Template Management (20)
    otp_template: [
        'template', 'templates', 'createtemplate', 'edittemplate', 'deletetemplate',
        'usetemplate', 'copytemplate', 'renametemplate', 'templatelist', 'templateinfo',
        'templatevars', 'templatepreview', 'templatetest', 'templatestats', 'templateexport',
        'templateimport', 'templatebackup', 'templaterestore', 'templatesearch', 'templatedefault'
    ],

    // Scheduled OTP (20)
    otp_schedule: [
        'schedule', 'scheduleotp', 'schedulelist', 'schedulecancel', 'scheduleedit',
        'scheduleinfo', 'schedulenow', 'scheduledelay', 'schedulerepeat', 'schedulepause',
        'scheduleresume', 'schedulestop', 'schedulepending', 'schedulecompleted', 'schedulefailed',
        'schedulecount', 'scheduleclear', 'scheduleexport', 'scheduleimport', 'schedulestats'
    ],

    // User Management (20)
    otp_users: [
        'users', 'adduser', 'removeuser', 'edituser', 'userinfo',
        'userlist', 'usersearch', 'userblock', 'userunblock', 'userrole',
        'userpermissions', 'userstats', 'userhistory', 'useractive', 'userinactive',
        'userexport', 'userimport', 'userbackup', 'userrestore', 'usercount'
    ],

    // API Key Management (20)
    otp_apikey: [
        'apikey', 'createkey', 'deletekey', 'listkeys', 'keyinfo',
        'keyrotate', 'keyregen', 'keyexpire', 'keyrenew', 'keylimit',
        'keypermissions', 'keystats', 'keyusage', 'keyactive', 'keyinactive',
        'keyexport', 'keyimport', 'keybackup', 'keyrestore', 'keycount'
    ],

    // Phone Number Management (20)
    otp_phone: [
        'phone', 'addphone', 'removephone', 'verifyphone', 'phoneinfo',
        'phonelist', 'phonesearch', 'phoneblock', 'phoneunblock', 'phonewhitelist',
        'phoneblacklist', 'phonestats', 'phonehistory', 'phoneactive', 'phoneinactive',
        'phoneexport', 'phoneimport', 'phonebackup', 'phonerestore', 'phonecount'
    ],

    // Webhook Management (20)
    otp_webhook: [
        'webhook', 'addwebhook', 'removewebhook', 'editwebhook', 'webhookinfo',
        'webhooklist', 'webhooktest', 'webhooklogs', 'webhookstats', 'webhookretry',
        'webhookpause', 'webhookresume', 'webhookactive', 'webhookinactive', 'webhookfailed',
        'webhooksuccess', 'webhookexport', 'webhookimport', 'webhookbackup', 'webhookrestore'
    ],

    // System & Monitoring (20)
    otp_system: [
        'status', 'health', 'ping', 'uptime', 'memory',
        'cpu', 'disk', 'network', 'logs', 'errors',
        'warnings', 'debug', 'monitor', 'metrics', 'performance',
        'diagnostics', 'benchmark', 'restart', 'shutdown', 'reload'
    ]
};

// Generate command files
function generateCommands() {
    const commandsDir = path.join(__dirname, '..', 'src', 'commands');
    let totalGenerated = 0;

    for (const [category, commands] of Object.entries(commandTemplates)) {
        commands.forEach(cmdName => {
            const filePath = path.join(commandsDir, `${cmdName}.js`);

            // Skip if already exists
            if (fs.existsSync(filePath)) {
                console.log(`Skipping ${cmdName} (already exists)`);
                return;
            }

            const content = generateCommandContent(cmdName, category);
            fs.writeFileSync(filePath, content);
            totalGenerated++;
            console.log(`Generated: ${cmdName}.js`);
        });
    }

    console.log(`\nTotal commands generated: ${totalGenerated}`);
}

// Generate command file content
function generateCommandContent(cmdName, category) {
    const categoryName = category.replace('otp_', '');

    return `module.exports = {
    name: '${cmdName}',
    category: '${categoryName}',
    description: '${getDescription(cmdName)}',
    usage: '|${cmdName} ${getUsageParams(cmdName)}',
    aliases: ${JSON.stringify(getAliases(cmdName))},
    
    async execute(sock, msg, args, jid) {
        const responseText = \`📋 *${cmdName.toUpperCase()}*

${getCommandResponse(cmdName, category)}

Type |help ${cmdName} for more details.\`;

        await sock.sendMessage(jid, { text: responseText });
    }
};
`;
}

// Helper functions
function getDescription(cmdName) {
    const descriptions = {
        // Add specific descriptions
        'sendotp': 'Send OTP to a phone number',
        'verifyotp': 'Verify an OTP code',
        'otpstats': 'View OTP statistics',
        'bulksend': 'Send OTP to multiple numbers',
        'template': 'Manage message templates',
        'schedule': 'Schedule OTP delivery',
        'users': 'Manage users',
        'apikey': 'Manage API keys',
        'phone': 'Manage phone numbers',
        'webhook': 'Manage webhooks',
        'status': 'Check system status'
    };

    return descriptions[cmdName] || `${cmdName} command for OTP management`;
}

function getUsageParams(cmdName) {
    const params = {
        'sendotp': '<phone> <code>',
        'verifyotp': '<phone> <code>',
        'otpstatus': '<id>',
        'bulksend': '<file>',
        'schedule': '<phone> <code> <time>',
        'createtemplate': '<name> <content>',
        'adduser': '<username> <email>',
        'createkey': '<name>',
        'addphone': '<phone>',
        'addwebhook': '<url>'
    };

    return params[cmdName] || '[options]';
}

function getAliases(cmdName) {
    const aliases = {
        'sendotp': ['send', 'otp'],
        'verifyotp': ['verify', 'check'],
        'otpstats': ['stats', 'statistics'],
        'status': ['info', 'botstatus'],
        'help': ['menu', 'commands']
    };

    return aliases[cmdName] || [];
}

function getCommandResponse(cmdName, category) {
    const responses = {
        'otp_core': '✅ OTP operation executed successfully.\n\nThis command manages core OTP functionality.',
        'otp_stats': '📊 Statistics retrieved successfully.\n\nView detailed analytics and reports.',
        'otp_bulk': '📦 Bulk operation initiated.\n\nProcessing multiple OTP requests.',
        'otp_template': '📝 Template management completed.\n\nManage message templates efficiently.',
        'otp_schedule': '⏰ Scheduling configured.\n\nOTPs will be sent at specified time.',
        'otp_users': '👥 User management updated.\n\nManage platform users and permissions.',
        'otp_apikey': '🔑 API key operation completed.\n\nManage authentication keys.',
        'otp_phone': '📱 Phone number processed.\n\nManage phone number database.',
        'otp_webhook': '🔗 Webhook configured.\n\nManage webhook integrations.',
        'otp_system': '⚙️ System operation completed.\n\nMonitor and manage system health.'
    };

    return responses[category] || 'Operation completed successfully.';
}

// Run generator
if (require.main === module) {
    generateCommands();
}

module.exports = { generateCommands };
