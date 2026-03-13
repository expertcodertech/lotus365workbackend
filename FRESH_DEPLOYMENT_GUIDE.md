# 🚀 FRESH DEPLOYMENT GUIDE - Lotus365 Work Platform

## 🧹 **STEP 1: Clean Everything**

```bash
# Stop all PM2 processes
pm2 stop all
pm2 delete all
pm2 flush

# Kill any remaining processes
pkill -f node
pkill -f npm
pkill -f next

# Remove old deployment
rm -rf /opt/lotus365workbackend
rm -rf lotus365workbackend

# Clean ports
sudo lsof -t -i tcp:3000 | xargs kill -9 2>/dev/null || true
sudo lsof -t -i tcp:3001 | xargs kill -9 2>/dev/null || true
```

## 📥 **STEP 2: Fresh Clone**

```bash
# Create clean directory
sudo mkdir -p /opt/lotus365workbackend
sudo chown $USER:$USER /opt/lotus365workbackend
cd /opt/lotus365workbackend

# Clone latest code with all fixes
git clone https://github.com/expertcodertech/lotus365workbackend.git .
ls -la  # Verify files are there
```

## 🚀 **STEP 3: Deploy**

```bash
# Make deployment script executable
chmod +x deploy-without-docker.sh

# Run deployment (this will handle everything)
./deploy-without-docker.sh
```

## ✅ **What the Deployment Script Does:**

1. **System Setup**: Updates packages, installs Node.js, PM2, Nginx
2. **Environment**: Copies real credentials from `.env` files
3. **Backend**: Installs deps, builds, creates admin user, starts with PM2
4. **Frontend**: Installs deps, builds, starts on port 3001 with PM2
5. **Nginx**: Configures reverse proxy
6. **Firewall**: Sets up security rules

## 🔧 **FIXES INCLUDED:**

- ✅ **CORS Fixed**: Backend allows requests from `91.184.244.196:3001`
- ✅ **Admin User**: Automatically created during deployment
- ✅ **Authentication**: Frontend dashboard protected
- ✅ **Port Management**: Proper port allocation and conflict resolution

## 🌐 **Expected Results:**

- **Backend API**: `http://91.184.244.196:3000/v1`
- **Admin Panel**: `http://91.184.244.196:3001`
- **Login**: Phone `+919876543210`, Password `password123`

## 🧪 **Test After Deployment:**

```bash
# Check PM2 status
pm2 status

# Test backend
curl http://localhost:3000/v1/config/app-version

# Test frontend
curl -I http://localhost:3001

# Test admin login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","password":"password123"}'
```

## 🛠️ **If Issues Occur:**

```bash
# Check logs
pm2 logs

# Check specific service
pm2 logs lotus365-backend
pm2 logs lotus365-frontend

# Restart services
pm2 restart all

# Check ports
sudo netstat -tulpn | grep -E "(3000|3001)"
```

---

**🪷 Ready for clean deployment with all fixes included!**