const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DB_PATH = 'test_verification.wodb';
const MASTER_PASSWORD = 'admin_test';

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data || '{}');
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTest() {
    console.log('Starting Verification Test...');
    
    // Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    const env = { 
        ...process.env, 
        PORT: PORT, 
        BOT_MOCK_MODE: 'true',
        DB_PATH: DB_PATH,
        MASTER_PASSWORD: MASTER_PASSWORD,
        DB_MASTER_KEY: 'test-secret-key'
    };

    const server = spawn('node', ['src/index.js'], { env, stdio: 'inherit' });

    // Wait for server to start
    await new Promise(r => setTimeout(r, 3000));

    try {
        console.log('1. Generating Token...');
        const genRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/admin/generate-token',
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_PASSWORD
            }
        });
        
        console.log('Generate Token Status:', genRes.statusCode);
        if (genRes.statusCode !== 200) throw new Error('Failed to generate token');
        
        const token = genRes.body.token;
        console.log('Token:', token);

        console.log('2. Sending OTP...');
        const sendRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, {
            phone: '08123456789',
            message: 'Your OTP is 123456'
        });

        console.log('Send OTP Status:', sendRes.statusCode);
        console.log('Send Response:', sendRes.body);
        
        if (sendRes.statusCode !== 200) throw new Error('Failed to send OTP');
        if (sendRes.body.data.mode !== 'mock') throw new Error('Not in Mock Mode');

        console.log('3. Checking Rate Limit (Sending again)...');
        await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, { phone: '08123', message: 'test' });
        // Assume limit is default 100, so it should pass.

        // Wait for async log
        await new Promise(r => setTimeout(r, 1000));
        
        // Verify DB file exists
        if (!fs.existsSync(DB_PATH)) throw new Error('DB file not created');
        console.log('DB file exists.');

        console.log('TEST PASSED');

    } catch (e) {
        console.error('TEST FAILED:', e);
        process.exit(1);
    } finally {
        server.kill();
        // Cleanup
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    }
}

runTest();
