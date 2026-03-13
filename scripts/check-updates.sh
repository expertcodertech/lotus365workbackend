#!/bin/bash

# 🔄 Lotus365 Auto-Update Checker
# Checks for new commits and updates if found

LOG_FILE="/var/log/lotus365-updates.log"
LOCK_FILE="/tmp/lotus365-update.lock"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if update is already running
if [ -f "$LOCK_FILE" ]; then
    exit 0
fi

# Navigate to project directory
cd /opt/lotus365 || exit 1

# Fetch latest changes
git fetch origin main >/dev/null 2>&1

# Check if there are new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    # No updates available
    exit 0
fi

# Create lock file
touch "$LOCK_FILE"

# Cleanup function
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

log "🔄 New updates detected, starting deployment..."

# Pull latest changes
log "📥 Pulling latest code..."
if git pull origin main; then
    log "✅ Code updated successfully"
else
    log "❌ Failed to pull code"
    exit 1
fi

# Stop existing containers
log "🛑 Stopping containers..."
docker-compose down

# Build and start new containers
log "🔨 Building and starting containers..."
if docker-compose up -d --build; then
    log "✅ Containers started successfully"
else
    log "❌ Failed to start containers"
    exit 1
fi

# Wait for services
log "⏳ Waiting for services..."
sleep 30

# Health checks
if curl -f -s http://localhost:3002/v1/health > /dev/null && \
   curl -f -s http://localhost:3003 > /dev/null; then
    log "✅ Update completed successfully"
    
    # Clean up old images
    docker image prune -f >/dev/null 2>&1
else
    log "❌ Health checks failed after update"
    exit 1
fi