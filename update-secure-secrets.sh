#!/bin/bash

echo "🔐 Updating Lotus365 with Ultra-Secure JWT Secrets..."
echo ""

# Ultra-secure JWT secrets (generated with cryptographic randomness)
JWT_ACCESS_SECRET="m5Dtv4CxHfSETHUWj4KXOF5N52J5iJF6xxzfNCegd/RQw6/WPWR/oacBzF7sO9a9j1IewBx2Xq8N5DNOYhM08A=="
JWT_REFRESH_SECRET="N057Jz1+PKNbNsMEtq5VZlGRpCY0ksOXtClGwue6EK4pK4u9154Xtu5eHX7+UCrqnr7tqnjHSbTGayrR6I3pRg=="

echo "✅ Using ultra-secure JWT secrets (64-byte cryptographic random)"
echo ""

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Update docker-compose.yml with ultra-secure secrets
echo "🔄 Updating docker-compose.yml with ultra-secure secrets..."
sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|g" docker-compose.yml
sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" docker-compose.yml

# Update backend/.env as well
echo "🔄 Updating backend/.env file..."
sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|g" backend/.env
sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" backend/.env

echo "✅ Updated configuration files with ultra-secure secrets"
echo ""

# Rebuild and start
echo "🚀 Rebuilding and starting with new secrets..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🔍 Testing Services:"
echo "Backend Health:"
curl -f http://localhost:3002/v1/health && echo "✅ Backend OK" || echo "❌ Backend Failed"

echo ""
echo "Login Test:"
curl -X POST http://localhost:3002/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","password":"password123"}' \
  && echo -e "\n✅ Login Working!" || echo -e "\n❌ Login Failed"

echo ""
echo "🎉 Lotus365 is now running with ultra-secure JWT secrets!"
echo ""
echo "Your new secrets:"
echo "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"