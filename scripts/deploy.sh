#!/bin/bash

# 🚀 Lotus365 VPS Deployment Script
# This script sets up the production environment on the VPS

set -e

echo "🪷 Starting Lotus365 VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/lotus365"
REPO_URL="https://github.com/expertcodertech/lotus365workbackend.git"
VPS_IP="91.184.244.196"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Ensure user is in docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker $USER

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already installed"
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo apt install -y git
    print_success "Git installed successfully"
else
    print_success "Git is already installed"
fi

# Create project directory
print_status "Setting up project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone or update repository
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_DIR
    git pull origin main
else
    print_status "Cloning repository..."
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Create environment files
print_status "Creating environment files..."

# Backend environment
cat > backend/.env << EOF
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://postgres.zdqxygisywmjoeimjflc:wBJs%2Fy%3FP%21d.%25U6w@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=lotus365_super_secret_jwt_key_2026_production
JWT_REFRESH_SECRET=lotus365_refresh_secret_key_2026_production
CORS_ORIGIN=http://$VPS_IP:3003,https://admin.lotus365.app
EOF

# Frontend environment
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://$VPS_IP:3002/v1
NODE_ENV=production
EOF

# Create nginx directory
mkdir -p nginx/ssl

# Set up firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3002/tcp
sudo ufw allow 3003/tcp
sudo ufw --force enable

# Build and start containers
print_status "Building and starting Docker containers..."

# Use newgrp to apply docker group without logout
newgrp docker << 'EONG'
cd /opt/lotus365
docker-compose down || true
docker-compose build --no-cache
docker-compose up -d
EONG

# Alternative: run with sudo if newgrp doesn't work
if [ $? -ne 0 ]; then
    print_warning "Using sudo for Docker commands..."
    sudo docker-compose down || true
    sudo docker-compose build --no-cache
    sudo docker-compose up -d
fi

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health check..."
if curl -f http://localhost/health; then
    print_success "Health check passed!"
else
    print_warning "Health check failed, but services might still be starting..."
fi

# Display status
print_status "Checking container status..."
newgrp docker << 'EONG'
docker-compose ps
EONG

# Alternative status check
if [ $? -ne 0 ]; then
    sudo docker-compose ps
fi

print_success "🎉 Lotus365 deployment completed!"
echo ""
echo "📊 Service URLs:"
echo "   🔗 Backend API: http://$VPS_IP:3002"
echo "   🖥️  Admin Panel: http://$VPS_IP:3003"
echo "   🌐 Nginx Proxy: http://$VPS_IP"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart services: docker-compose restart"
echo "   Stop services: docker-compose down"
echo "   Update deployment: git pull && docker-compose up -d --build"
echo ""
print_success "Deployment script completed successfully!"