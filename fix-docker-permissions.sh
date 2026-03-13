#!/bin/bash

# 🔧 Fix Docker Permissions - Lotus365
echo "🔧 Fixing Docker permissions..."

# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes without logout
newgrp docker << EONG
echo "✅ Docker group applied successfully!"

# Navigate to project directory
cd /opt/lotus365

# Now try Docker commands
echo "🐳 Testing Docker access..."
docker --version
docker-compose --version

# Build and start containers
echo "🚀 Starting Lotus365 containers..."
docker-compose down || true
docker-compose build --no-cache
docker-compose up -d

# Check status
echo "📊 Container status:"
docker-compose ps

echo "🎉 Docker permissions fixed and containers started!"
EONG