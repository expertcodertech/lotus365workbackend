#!/bin/bash

# 🚀 Lotus365 Work Platform - Deploy WITHOUT Docker
# For immediate deployment when Docker is not available

set -e  # Exit on any error

echo "🪷 Lotus365 Work Platform - Non-Docker Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')
print_info "Server IP detected: $SERVER_IP"

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated"

# Install Node.js 18
print_info "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install PM2
print_info "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Install Nginx
print_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_status "Nginx installed and started"
else
    print_status "Nginx already installed"
fi

# Setup environment files
print_info "Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_status "Backend environment configured with real credentials"
else
    print_status "Backend environment already exists"
fi

# Frontend environment
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    # Update with current server IP and port 3002
    sed -i "s|http://91.184.244.196:3000/v1|http://$SERVER_IP:3002/v1|g" frontend/.env.local
    print_status "Frontend environment configured with server IP: $SERVER_IP on port 3002"
else
    print_status "Frontend environment already exists"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install
print_status "Backend dependencies installed"

# Build backend
print_info "Building backend..."
npm run build
print_status "Backend built successfully"

# Create admin user
print_info "Creating admin user..."
npm run create-admin
print_status "Admin user setup complete"

# Start backend with PM2 on port 3002
print_info "Starting backend with PM2..."
pm2 stop lotus365-backend 2>/dev/null || true
pm2 delete lotus365-backend 2>/dev/null || true
PORT=3002 pm2 start dist/main.js --name "lotus365-backend"
print_status "Backend started on port 3002"

# Go back to root directory
cd ..

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm install
print_status "Frontend dependencies installed"

# Build frontend
print_info "Building frontend..."
npm run build
print_status "Frontend built successfully"

# Start frontend with PM2 on port 3003
print_info "Starting frontend with PM2..."
pm2 stop lotus365-frontend 2>/dev/null || true
pm2 delete lotus365-frontend 2>/dev/null || true
PORT=3003 pm2 start npm --name "lotus365-frontend" -- start
print_status "Frontend started on port 3003"

# Save PM2 configuration
pm2 save
pm2 startup

# Go back to root directory
cd ..

# Configure Nginx
print_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/lotus365 > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Backend API on port 3002
    location /v1/ {
        proxy_pass http://localhost:3002/v1/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Frontend Admin Panel on port 3003
    location / {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/lotus365 /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
print_status "Nginx configured and reloaded"

# Configure firewall
print_info "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3002
sudo ufw allow 3003
sudo ufw --force enable
print_status "Firewall configured"

# Wait for services to start
print_info "Waiting for services to start..."
sleep 10

# Test deployment
print_info "Testing deployment..."
if curl -f -s http://localhost:3002/v1/config/app-version > /dev/null; then
    print_status "Backend API is responding on port 3002"
else
    print_warning "Backend API might still be starting..."
fi

if curl -f -s -I http://localhost:3003 > /dev/null; then
    print_status "Frontend is responding on port 3003"
else
    print_warning "Frontend might still be starting..."
fi

# Show PM2 status
print_info "PM2 Process Status:"
pm2 status

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
print_status "Your Lotus365 Work Platform is now live!"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://$SERVER_IP:3002"
echo "   Admin Panel: http://$SERVER_IP:3003"
echo "   Main Site: http://$SERVER_IP (via Nginx)"
echo ""
echo "👤 Admin Login:"
echo "   Phone: +919876543210"
echo "   Password: password123"
echo ""
echo "📊 Management Commands:"
echo "   View logs: pm2 logs"
echo "   Restart backend: pm2 restart lotus365-backend"
echo "   Restart frontend: pm2 restart lotus365-frontend"
echo "   Stop all: pm2 stop all"
echo "   Nginx status: sudo systemctl status nginx"
echo ""
print_status "🪷 Lotus365 Work Platform is ready for use!"
echo ""
print_info "Note: Docker is not required for this deployment method."
print_info "Your platform is running with Node.js + PM2 + Nginx"