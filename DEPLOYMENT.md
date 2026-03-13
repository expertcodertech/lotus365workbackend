# 🚀 Lotus365 Work Platform - VPS Deployment Guide

This guide will help you deploy the Lotus365 Work Platform on your VPS server.

## 📋 Prerequisites

- Ubuntu/Debian VPS server
- Root or sudo access
- Domain name (optional but recommended)
- PostgreSQL database (local or cloud like Supabase)

## 🔧 Step 1: Server Preparation

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group changes
exit
```

### Install Git
```bash
sudo apt install git -y
```

## 📥 Step 2: Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/lotus365
sudo chown $USER:$USER /opt/lotus365

# Clone repository
cd /opt/lotus365
git clone https://github.com/expertcodertech/lotus365workbackend.git .
```

## ⚙️ Step 3: Configuration

### Backend Configuration
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend environment
nano backend/.env
```

**Configure these variables in `backend/.env`:**
```env
# Database (use your PostgreSQL credentials)
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=lotus365_work

# JWT Secrets (IMPORTANT: Change these!)
JWT_ACCESS_SECRET=your-super-secure-access-secret-change-this-now
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-change-this-now

# App
PORT=3000
NODE_ENV=production
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
# Replace with your domain or server IP
NEXT_PUBLIC_API_URL=http://your-server-ip:3000/v1
# OR for domain:
# NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
```

### Domain Configuration (Optional)
If you have a domain, update `nginx.conf`:
```bash
nano nginx.conf
```

Replace `your-domain.com` with your actual domain:
- `api.your-domain.com` for backend
- `admin.your-domain.com` for frontend

## 🚀 Step 4: Deploy

### Make deploy script executable
```bash
chmod +x deploy.sh
```

### Run deployment
```bash
./deploy.sh
```

This will:
1. Pull latest code
2. Build Docker containers
3. Start all services
4. Show service status

## 🔍 Step 5: Verify Deployment

### Check services
```bash
docker-compose ps
```

### Test API
```bash
curl http://localhost:3000/v1/config/app-version
```

### Test Frontend
```bash
curl -I http://localhost:3001
```

## 👤 Step 6: Create Admin User

### Register admin user via API
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "fullName": "Admin User",
    "password": "your_secure_admin_password"
  }'
```

### Make user admin (connect to your database)
```sql
UPDATE users SET role = 'admin' WHERE phone = '+919876543210';
```

## 🌐 Step 7: Access Your Platform

### URLs
- **Backend API**: http://your-server-ip:3000
- **Admin Panel**: http://your-server-ip:3001

### Admin Login
- **Phone**: +919876543210
- **Password**: your_secure_admin_password

## 🔒 Step 8: Security (Recommended)

### Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw enable
```

### SSL Certificate (if using domain)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com -d admin.your-domain.com
```

## 📊 Step 9: Monitoring

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Service status
```bash
docker-compose ps
```

### Restart services
```bash
docker-compose restart
```

## 🔄 Updates

To update your platform:
```bash
cd /opt/lotus365
git pull origin main
./deploy.sh
```

## 🛠️ Troubleshooting

### Services not starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Database connection issues
1. Check database credentials in `backend/.env`
2. Ensure database server is accessible
3. Check firewall settings

### API not accessible
1. Check if backend container is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify port 3000 is open

### Frontend not loading
1. Check if frontend container is running: `docker-compose ps`
2. Check frontend logs: `docker-compose logs frontend`
3. Verify API URL in `frontend/.env.local`

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Check firewall settings

---

**🪷 Lotus365 Work Platform - Ready for Production!**