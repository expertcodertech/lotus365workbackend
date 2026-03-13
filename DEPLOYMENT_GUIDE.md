# 🚀 Lotus365 Production Deployment Guide

## Overview
This guide covers the complete deployment setup for Lotus365 with Docker containers and CI/CD pipeline.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Server (91.184.244.196)             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Nginx    │  │   Backend   │  │      Frontend       │  │
│  │   (Port 80) │  │ (Port 3002) │  │    (Port 3003)      │  │
│  │             │  │             │  │                     │  │
│  │ Reverse     │  │ NestJS API  │  │   Next.js Admin     │  │
│  │ Proxy       │  │ + Auth      │  │   Panel             │  │
│  │ + SSL       │  │ + Database  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         Supabase PostgreSQL Database                   │ │
│  │    aws-1-ap-south-1.pooler.supabase.com:6543          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2 cores minimum
- **Network**: Public IP with ports 80, 443, 3002, 3003 open

### Local Development
- Node.js 20+
- Docker & Docker Compose
- Git

## 🔧 Initial VPS Setup

### 1. Connect to VPS
```bash
ssh root@91.184.244.196
```

### 2. Create Non-Root User
```bash
adduser lotus365
usermod -aG sudo lotus365
su - lotus365
```

### 3. Run Deployment Script
```bash
curl -fsSL https://raw.githubusercontent.com/expertcodertech/lotus365workbackend/main/deploy-vps.sh | bash
```

## 🐳 Docker Configuration

### Services Overview
- **Backend**: NestJS API server (Port 3002)
- **Frontend**: Next.js admin panel (Port 3003)
- **Nginx**: Reverse proxy and load balancer (Port 80/443)

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://postgres.zdqxygisywmjoeimjflc:wBJs%2Fy%3FP%21d.%25U6w@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=lotus365_super_secret_jwt_key_2026_production
JWT_REFRESH_SECRET=lotus365_refresh_secret_key_2026_production
CORS_ORIGIN=http://91.184.244.196:3003,https://admin.lotus365.app
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://91.184.244.196:3002/v1
NODE_ENV=production
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
The deployment pipeline automatically:

1. **Build & Test**: Runs tests for both backend and frontend
2. **Docker Build**: Creates optimized Docker images
3. **Deploy**: Pushes to VPS and restarts services
4. **Health Check**: Verifies deployment success

### Required GitHub Secrets
```
VPS_HOST=91.184.244.196
VPS_USERNAME=lotus365
VPS_SSH_KEY=<private_ssh_key>
VPS_PORT=22
GITHUB_TOKEN=<auto_generated>
```

### Trigger Deployment
```bash
git add .
git commit -m "feat: update backend API"
git push origin main
```

## 🚀 Manual Deployment

### 1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/expertcodertech/lotus365workbackend.git lotus365
sudo chown -R lotus365:lotus365 lotus365
cd lotus365
```

### 2. Build and Start
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 3. Verify Deployment
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Health check
curl http://localhost/health
```

## 🔍 Monitoring & Maintenance

### Health Checks
- **Backend**: `http://91.184.244.196:3002/v1/health`
- **Frontend**: `http://91.184.244.196:3003`
- **Nginx**: `http://91.184.244.196/health`

### Log Management
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Clear logs
docker-compose logs --tail=0 -f
```

### Database Backup
```bash
# Create backup
docker exec -t lotus365_backend_1 pg_dump -h aws-1-ap-south-1.pooler.supabase.com -U postgres.zdqxygisywmjoeimjflc -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i lotus365_backend_1 psql -h aws-1-ap-south-1.pooler.supabase.com -U postgres.zdqxygisywmjoeimjflc -d postgres < backup.sql
```

## 🔒 Security Configuration

### Firewall Rules
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3002/tcp  # Backend API
sudo ufw allow 3003/tcp  # Frontend
sudo ufw enable
```

### SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d lotus365.app -d www.lotus365.app

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Performance Optimization

### Docker Resource Limits
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Nginx Caching
```nginx
# Add to nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
sudo netstat -tulpn | grep :3002
sudo kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
# Test database connection
docker exec -it lotus365_backend_1 npm run test:db
```

#### 3. Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose build --no-cache backend
docker-compose up -d backend
```

#### 4. Admin Panel Shows "No Users"
```bash
# Check backend API
curl http://localhost:3002/v1/health

# Test admin endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3002/v1/admin/users
```

## 📱 Mobile App Configuration

### Android App Settings
Update `build.gradle.kts`:
```kotlin
buildConfigField("String", "BASE_URL", "\"http://91.184.244.196:3002/v1/\"")
```

### Test Credentials
- **Admin Login**: `+919876543210` / `password123`
- **Test User**: `+917665131205` / `password123`

## 🔄 Update Process

### Automatic (via CI/CD)
1. Push code to `main` branch
2. GitHub Actions builds and deploys automatically
3. Services restart with zero downtime

### Manual Update
```bash
cd /opt/lotus365
git pull origin main
docker-compose up -d --build
```

## 📞 Support

### Service URLs
- **🔗 Backend API**: http://91.184.244.196:3002
- **🖥️ Admin Panel**: http://91.184.244.196:3003
- **📱 Android APK**: Available in releases

### Useful Commands
```bash
# Restart all services
docker-compose restart

# Update single service
docker-compose up -d --build backend

# Scale services
docker-compose up -d --scale backend=2

# Clean up
docker system prune -f
```

---

**🎉 Deployment Complete!**

Your Lotus365 platform is now running in production with:
- ✅ Automated CI/CD pipeline
- ✅ Docker containerization
- ✅ Health monitoring
- ✅ Security hardening
- ✅ Performance optimization