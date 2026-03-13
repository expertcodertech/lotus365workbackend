#!/bin/bash

# 🪷 Lotus365 Webhook Auto-Deploy Script
# This script can be triggered by GitHub webhooks

LOG_FILE="/var/log/lotus365-deploy.log"
LOCK_FILE="/tmp/lotus365-deploy.lock"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if deployment is already running
if [ -f "$LOCK_FILE" ]; then
    log "❌ Deployment already in progress. Exiting."
    exit 1
fi

# Create lock file
touch "$LOCK_FILE"

# Cleanup function
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

log "🚀 Starting webhook deployment..."

# Navigate to project directory
cd /opt/lotus365 || {
    log "❌ Failed to navigate to /opt/lotus365"
    exit 1
}

# Pull latest changes
log "📥 Pulling latest code from GitHub..."
if git pull origin main; then
    log "✅ Code pulled successfully"
else
    log "❌ Failed to pull code"
    exit 1
fi

# Stop existing containers
log "🛑 Stopping existing containers..."
docker-compose down

# Build and start new containers
log "🔨 Building and starting containers..."
if docker-compose up -d --build; then
    log "✅ Containers started successfully"
else
    log "❌ Failed to start containers"
    exit 1
fi

# Wait for services to initialize
log "⏳ Waiting for services to initialize..."
sleep 30

# Health checks
log "🔍 Running health checks..."

# Check backend
if curl -f -s http://localhost:3002/v1/health > /dev/null; then
    log "✅ Backend is healthy"
else
    log "❌ Backend health check failed"
    exit 1
fi

# Check frontend
if curl -f -s http://localhost:3003 > /dev/null; then
    log "✅ Frontend is healthy"
else
    log "❌ Frontend health check failed"
    exit 1
fi

# Clean up old Docker images
log "🧹 Cleaning up old Docker images..."
docker image prune -f

log "🎉 Deployment completed successfully!"
log "🌐 Backend: http://91.184.244.196:3002"
log "🖥️ Admin Panel: http://91.184.244.196:3003"

# Send notification (optional)
# curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
#      -d "chat_id=$TELEGRAM_CHAT_ID" \
#      -d "text=✅ Lotus365 deployed successfully!"