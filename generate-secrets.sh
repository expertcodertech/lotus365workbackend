#!/bin/bash

# Generate secure JWT secrets for production
echo "🔐 Generating secure JWT secrets for Lotus365..."
echo ""

# Generate new secure secrets
JWT_ACCESS_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')

echo "✅ Generated new JWT secrets:"
echo ""
echo "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""

# Update docker-compose.yml with new secrets
echo "🔄 Updating docker-compose.yml with new secrets..."

# Create backup
cp docker-compose.yml docker-compose.yml.backup

# Update the secrets in docker-compose.yml
sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|g" docker-compose.yml
sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" docker-compose.yml

echo "✅ Updated docker-compose.yml with new secrets"
echo ""

# Update .env file as well
echo "🔄 Updating backend/.env file..."
sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET|g" backend/.env
sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" backend/.env

echo "✅ Updated backend/.env file"
echo ""

echo "🚀 Ready to restart containers with new secrets!"
echo "Run: docker-compose down && docker-compose up -d --build"