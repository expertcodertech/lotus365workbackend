# 🚀 Complete VPS Deployment Guide - Lotus365 Work Platform

This is a complete, step-by-step guide to deploy your Lotus365 Work Platform on any VPS server.

## 📋 Prerequisites

- **VPS Server** (Ubuntu 20.04+ or Debian 10+)
- **Root access** or sudo privileges
- **Domain name** (optional but recommended)
- **Database** (PostgreSQL - local or cloud like Supabase)

---

## 🖥️ STEP 1: VPS Server Setup

### Connect to Your VPS
```bash
ssh root@your-server-ip
# OR
ssh username@your-server-ip
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Tools
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

---

## 🐳 STEP 2: Install Docker & Docker Compose

### Install Docker
```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Logout and Login Again
```bash
exit
# Then reconnect to apply docker group changes
ssh root@your-server-ip
```

---

## 📥 STEP 3: Clone and Setup Project

### Create Application Directory
```bash
sudo mkdir -p /opt/lotus365
sudo chown $USER:$USER /opt/lotus365
cd /opt/lotus365
```

### Clone Repository
```bash
git clone https://github.com/expertcodertech/lotus365workbackend.git .
ls -la  # Verify files are downloaded
```

---

## ⚙️ STEP 4: Database Setup

### Option A: Install PostgreSQL Locally
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE lotus365_work;
CREATE USER lotus365_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE lotus365_work TO lotus365_user;
ALTER USER lotus365_user CREATEDB;
\q
EOF
```

### Option B: Use Cloud Database (Supabase/AWS RDS)
If using cloud database, skip local PostgreSQL installation and use your cloud database credentials.

---

## 🔧 STEP 5: Configure Environment Variables

### Backend Configuration
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend environment
nano backend/.env
```

**Configure these variables in `backend/.env`:**
```env
# App Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (Local PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=lotus365_user
DB_PASSWORD=your_secure_password_here
DB_NAME=lotus365_work
DB_SSL=false

# OR for Cloud Database (Supabase example)
# DB_HOST=aws-1-ap-south-1.pooler.supabase.com
# DB_PORT=6543
# DB_USERNAME=postgres.your_project_id
# DB_PASSWORD="your_supabase_password"
# DB_NAME=postgres
# DB_SSL=true

# JWT Secrets (IMPORTANT: Change these!)
JWT_ACCESS_SECRET=your-super-secure-access-secret-change-this-now-12345
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-change-this-now-67890
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=60

# Redis (Optional - leave as localhost for now)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Frontend Configuration
```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local

# Edit frontend environment
nano frontend/.env.local
```

**Configure this variable in `frontend/.env.local`:**
```env
# Replace with your server IP or domain
NEXT_PUBLIC_API_URL=http://your-server-ip:3000/v1

# OR if you have a domain:
# NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
```

---

## 🌐 STEP 6: Domain Configuration (Optional)

If you have a domain, configure it:

### Update Nginx Configuration
```bash
nano nginx.conf
```

Replace `your-domain.com` with your actual domain:
```nginx
# Backend API
server_name api.your-domain.com;

# Frontend Admin Panel  
server_name admin.your-domain.com;
```

### Update Frontend Environment
```bash
nano frontend/.env.local
```
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
```

---

## 🚀 STEP 7: Deploy Application

### Make Deploy Script Executable
```bash
chmod +x deploy.sh
```

### Run Deployment
```bash
./deploy.sh
```

This will:
1. Pull latest code
2. Build Docker containers
3. Start all services
4. Show service status

### Monitor Deployment
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🔍 STEP 8: Verify Deployment

### Test Backend API
```bash
# Test API health
curl http://localhost:3000/v1/config/app-version

# Should return something like:
# {"success":true,"data":{"latest":"1.0.0","updateUrl":"","minSupported":"1.0.0"}}
```

### Test Frontend
```bash
# Test frontend
curl -I http://localhost:3001

# Should return HTTP 200 OK
```

### Check All Services
```bash
docker-compose ps
```

You should see all services running:
```
NAME                    COMMAND                  SERVICE             STATUS              PORTS
lotus365-backend-1      "docker-entrypoint.s…"   backend             running             0.0.0.0:3000->3000/tcp
lotus365-frontend-1     "docker-entrypoint.s…"   frontend            running             0.0.0.0:3001->3001/tcp
lotus365-nginx-1        "/docker-entrypoint.…"   nginx               running             0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## 👤 STEP 9: Create Admin User

### Register Admin User via API
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "fullName": "Admin User",
    "password": "your_secure_admin_password"
  }'
```

### Make User Admin in Database

#### For Local PostgreSQL:
```bash
sudo -u postgres psql -d lotus365_work -c "UPDATE users SET role = 'admin' WHERE phone = '+919876543210';"
```

#### For Cloud Database:
Connect to your database and run:
```sql
UPDATE users SET role = 'admin' WHERE phone = '+919876543210';
```

---

## 🔒 STEP 10: Security Configuration

### Configure Firewall
```bash
# Install UFW if not installed
sudo apt install -y ufw

# Configure firewall rules
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### SSL Certificate (If Using Domain)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com -d admin.your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🌐 STEP 11: Access Your Platform

### URLs
- **Backend API**: `http://your-server-ip:3000`
- **Admin Panel**: `http://your-server-ip:3001`

### With Domain:
- **Backend API**: `https://api.your-domain.com`
- **Admin Panel**: `https://admin.your-domain.com`

### Admin Login Credentials
- **Phone**: `+919876543210`
- **Password**: `your_secure_admin_password`

---

## 📊 STEP 12: Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Service Management
```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Restart specific service
docker-compose restart backend

# View service status
docker-compose ps
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Docker stats
docker stats
```

---

## 🔄 STEP 13: Updates & Maintenance

### Update Application
```bash
cd /opt/lotus365
git pull origin main
./deploy.sh
```

### Database Backup
```bash
# For local PostgreSQL
sudo -u postgres pg_dump lotus365_work > backup_$(date +%Y%m%d_%H%M%S).sql

# For cloud database
pg_dump -h your-db-host -U your-username -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Clean Up Docker
```bash
# Remove unused containers and images
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

## 🛠️ TROUBLESHOOTING

### Common Issues & Solutions

#### 1. Services Not Starting
```bash
# Check logs
docker-compose logs

# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Kill processes using ports
sudo lsof -t -i tcp:3000 | xargs kill -9
sudo lsof -t -i tcp:3001 | xargs kill -9
```

#### 2. Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U lotus365_user -d lotus365_work -c "SELECT version();"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 3. API Not Responding
```bash
# Check backend logs
docker-compose logs backend

# Check if backend container is running
docker-compose ps

# Restart backend
docker-compose restart backend
```

#### 4. Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Check API URL configuration
cat frontend/.env.local

# Test API connectivity from frontend container
docker-compose exec frontend curl http://backend:3000/v1/config/app-version
```

#### 5. Nginx Issues
```bash
# Check nginx logs
docker-compose logs nginx

# Test nginx configuration
docker-compose exec nginx nginx -t

# Restart nginx
docker-compose restart nginx
```

### Emergency Recovery
```bash
# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

---

## 📱 STEP 14: Android App Configuration

Update your Android app to point to the deployed backend:

### Debug Configuration (build.gradle.kts)
```kotlin
buildConfigField("String", "BASE_URL", "\"http://your-server-ip:3000/v1/\"")
```

### Production Configuration
```kotlin
buildConfigField("String", "BASE_URL", "\"https://api.your-domain.com/v1/\"")
```

---

## ✅ DEPLOYMENT COMPLETE!

Your Lotus365 Work Platform is now fully deployed and running!

### 🎉 What You Have:
- ✅ **Backend API** running on port 3000
- ✅ **Admin Panel** running on port 3001
- ✅ **Database** configured and connected
- ✅ **Admin user** created and ready
- ✅ **Security** configured with firewall
- ✅ **SSL** (if domain configured)
- ✅ **Monitoring** and logging setup

### 🔗 Access Points:
- **API Documentation**: Available through admin panel
- **Admin Dashboard**: Full platform management
- **User Registration**: Available via API
- **Mobile App**: Ready to connect

### 📞 Support:
If you encounter any issues, check the troubleshooting section above or review the logs using the monitoring commands.

---

**🪷 Congratulations! Your Lotus365 Work Platform is Live!**