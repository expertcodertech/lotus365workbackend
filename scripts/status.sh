#!/bin/bash

# 📊 Lotus365 Status Checker

echo "🪷 Lotus365 Work Platform Status"
echo "================================"
echo ""

# Check Git status
echo "📂 Git Status:"
cd /opt/lotus365
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_BRANCH=$(git branch --show-current)
echo "   Branch: $CURRENT_BRANCH"
echo "   Commit: $CURRENT_COMMIT"
echo "   Message: $(git log -1 --pretty=format:'%s')"
echo ""

# Check Docker containers
echo "🐳 Docker Containers:"
docker-compose ps
echo ""

# Check services health
echo "🔍 Health Checks:"

# Backend health
echo -n "   Backend (3002): "
if curl -f -s http://localhost:3002/v1/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Failed"
fi

# Frontend health
echo -n "   Frontend (3003): "
if curl -f -s http://localhost:3003 > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Failed"
fi

echo ""

# Check webhook service (if exists)
if systemctl is-active --quiet lotus365-webhook; then
    echo "🎣 Webhook Service: ✅ Running"
else
    echo "🎣 Webhook Service: ❌ Not running"
fi

echo ""

# Check recent logs
echo "📝 Recent Activity:"
if [ -f "/var/log/lotus365-deploy.log" ]; then
    echo "   Last deployment:"
    tail -3 /var/log/lotus365-deploy.log | sed 's/^/   /'
fi

if [ -f "/var/log/lotus365-updates.log" ]; then
    echo "   Last update check:"
    tail -1 /var/log/lotus365-updates.log | sed 's/^/   /'
fi

echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://91.184.244.196:3002"
echo "   Admin Panel: http://91.184.244.196:3003"
echo "   API Docs: http://91.184.244.196:3002/api"