#!/usr/bin/env node

// 🪷 Simple Webhook Server for Auto-Deployment
// Listens for GitHub webhooks and triggers deployment

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'lotus365-webhook-secret';
const DEPLOY_SCRIPT = '/opt/lotus365/scripts/webhook-deploy.sh';

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Execute deployment script
function deploy() {
    console.log('🚀 Starting deployment...');
    
    exec(`bash ${DEPLOY_SCRIPT}`, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Deployment failed:', error);
            return;
        }
        
        console.log('✅ Deployment output:', stdout);
        if (stderr) {
            console.error('⚠️ Deployment warnings:', stderr);
        }
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const signature = req.headers['x-hub-signature-256'];
            
            if (!signature || !verifySignature(body, signature)) {
                console.log('❌ Invalid signature');
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Unauthorized');
                return;
            }

            const payload = JSON.parse(body);
            
            // Check if it's a push to main branch
            if (payload.ref === 'refs/heads/main') {
                console.log('📥 Received push to main branch');
                deploy();
                
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Deployment triggered');
            } else {
                console.log('ℹ️ Push to non-main branch, ignoring');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Ignored');
            }
        } catch (error) {
            console.error('❌ Error processing webhook:', error);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🎣 Webhook server listening on port ${PORT}`);
    console.log(`🔐 Using secret: ${SECRET.substring(0, 8)}...`);
    console.log(`📜 Deploy script: ${DEPLOY_SCRIPT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down webhook server...');
    server.close(() => {
        console.log('✅ Webhook server stopped');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down webhook server...');
    server.close(() => {
        console.log('✅ Webhook server stopped');
        process.exit(0);
    });
});