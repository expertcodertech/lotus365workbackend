#!/bin/bash

# Lotus365 Work Platform Deployment Script
echo "🪷 Starting Lotus365 Work Platform deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=50

echo "✅ Deployment complete!"
echo "🌐 Backend API: http://your-domain.com:3000"
echo "🖥️ Admin Panel: http://your-domain.com:3001"