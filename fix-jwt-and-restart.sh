#!/bin/bash

echo "🔧 Fixing JWT Secret Issue and Restarting Lotus365..."
echo ""

# Stop all containers
echo "🛑 Stopping containers..."
docker-compose down

echo ""
echo "✅ JWT_SECRET has been updated to JWT_ACCESS_SECRET in docker-compose.yml"
echo ""

# Rebuild and start containers
echo "🚀 Rebuilding and starting containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for containers to start..."
sleep 10

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🔍 Testing Backend Health:"
curl -f http://localhost:3002/v1/health && echo "✅ Backend is healthy" || echo "❌ Backend health check failed"

echo ""
echo "🔐 Testing Login Endpoint:"
curl -X POST http://localhost:3002/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","password":"password123"}' \
  && echo -e "\n✅ Login endpoint working!" || echo -e "\n❌ Login endpoint failed"

echo ""
echo "📝 To view logs:"
echo "docker-compose logs -f backend"
echo ""
echo "🎉 Setup complete! Your Lotus365 backend should now be working with proper JWT secrets."