#!/bin/bash

# 🚀 Lotus365 Work Platform - Automated VPS Deployment Script
# This script automates the entire deployment process

set -e  # Exit on any error

echo "🪷 Lotus365 Work Platform - Automated Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated successfully"

# Install essential tools
print_info "Installing essential tools..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_status "Essential tools installed"

# Install Docker
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    sudo systemctl start docker
    sudo systemctl enable docker
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Create application directory
print_info "Setting up application directory..."
sudo mkdir -p /opt/lotus365
sudo chown $USER:$USER /opt/lotus365
cd /opt/lotus365

# Clone repository if not exists
if [ ! -d ".git" ]; then
    print_info "Cloning repository..."
    git clone https://github.com/expertcodertech/lotus365workbackend.git .
    print_status "Repository cloned successfully"
else
    print_info "Updating repository..."
    git pull origin main
    print_status "Repository updated successfully"
fi

# Setup environment files
print_info "Setting up environment configuration..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_warning "Backend environment file created. Please edit backend/.env with your database credentials."
    print_info "Opening backend/.env for editing..."
    read -p "Press Enter to continue after editing the file..."
    nano backend/.env
else
    print_status "Backend environment file already exists"
fi

# Frontend environment
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    
    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')
    
    # Update frontend environment with server IP
    sed -i "s|http://localhost:3000/v1|http://$SERVER_IP:3000/v1|g" frontend/.env.local
    
    print_status "Frontend environment configured with server IP: $SERVER_IP"
else
    print_status "Frontend environment file already exists"
fi

# Install PostgreSQL locally (optional)
read -p "Do you want to install PostgreSQL locally? (y/n): " install_postgres
if [[ $install_postgres =~ ^[Yy]$ ]]; then
    print_info "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    read -p "Enter database password for lotus365_user: " db_password
    sudo -u postgres psql << EOF
CREATE DATABASE lotus365_work;
CREATE USER lotus365_user WITH PASSWORD '$db_password';
GRANT ALL PRIVILEGES ON DATABASE lotus365_work TO lotus365_user;
ALTER USER lotus365_user CREATEDB;
\q
EOF
    
    # Update backend .env with local database settings
    sed -i "s|DB_HOST=.*|DB_HOST=localhost|g" backend/.env
    sed -i "s|DB_USERNAME=.*|DB_USERNAME=lotus365_user|g" backend/.env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$db_password|g" backend/.env
    sed -i "s|DB_NAME=.*|DB_NAME=lotus365_work|g" backend/.env
    sed -i "s|DB_SSL=.*|DB_SSL=false|g" backend/.env
    
    print_status "PostgreSQL installed and configured"
fi

# Configure firewall
print_info "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable
print_status "Firewall configured"

# Make deploy script executable
chmod +x deploy.sh

# Deploy application
print_info "Deploying application..."
./deploy.sh

# Wait for services to start
print_info "Waiting for services to start..."
sleep 30

# Test deployment
print_info "Testing deployment..."
if curl -f -s http://localhost:3000/v1/config/app-version > /dev/null; then
    print_status "Backend API is responding"
else
    print_error "Backend API is not responding"
fi

if curl -f -s -I http://localhost:3001 > /dev/null; then
    print_status "Frontend is responding"
else
    print_error "Frontend is not responding"
fi

# Create admin user
print_info "Creating admin user..."
read -p "Enter admin phone number (e.g., +919876543210): " admin_phone
read -p "Enter admin full name: " admin_name
read -s -p "Enter admin password: " admin_password
echo

curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"$admin_phone\",
    \"fullName\": \"$admin_name\",
    \"password\": \"$admin_password\"
  }" > /dev/null 2>&1

# Make user admin in database
if [[ $install_postgres =~ ^[Yy]$ ]]; then
    sudo -u postgres psql -d lotus365_work -c "UPDATE users SET role = 'admin' WHERE phone = '$admin_phone';" > /dev/null 2>&1
    print_status "Admin user created and configured"
else
    print_warning "Please manually update the user role to 'admin' in your database:"
    print_info "UPDATE users SET role = 'admin' WHERE phone = '$admin_phone';"
fi

# Get server IP for final instructions
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
print_status "Your Lotus365 Work Platform is now live!"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://$SERVER_IP:3000"
echo "   Admin Panel: http://$SERVER_IP:3001"
echo ""
echo "👤 Admin Login:"
echo "   Phone: $admin_phone"
echo "   Password: [your password]"
echo ""
echo "📊 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Stop: docker-compose down"
echo "   Update: git pull && ./deploy.sh"
echo ""
print_info "For detailed documentation, see COMPLETE_DEPLOYMENT_GUIDE.md"
echo ""
print_warning "IMPORTANT: Please secure your JWT secrets in backend/.env before production use!"
echo ""
print_status "🪷 Lotus365 Work Platform is ready for use!"