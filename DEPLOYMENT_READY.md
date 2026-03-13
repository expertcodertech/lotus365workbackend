# 🚀 DEPLOYMENT READY - REAL CREDENTIALS INCLUDED

## ⚠️ IMPORTANT SECURITY NOTICE
**Real production credentials are temporarily included in this repository for deployment purposes.**

### 📁 Files with Real Credentials:
- `backend/.env` - Real Supabase database credentials
- `frontend/.env.local` - Real server IP configuration

### 🔒 After Deployment:
1. **IMMEDIATELY** remove these files from git:
   ```bash
   git rm backend/.env frontend/.env.local
   git commit -m "Remove real credentials after deployment"
   git push
   ```

2. **Restore .gitignore** protection:
   ```bash
   # Uncomment .env exclusions in:
   # - backend/.gitignore
   # - frontend/.gitignore
   ```

## 🚀 Quick Deployment Commands

### On Your VPS (91.184.244.196):
```bash
# Clone repository
git clone https://github.com/expertcodertech/lotus365workbackend.git
cd lotus365workbackend

# Deploy without Docker (recommended)
chmod +x deploy-without-docker.sh
./deploy-without-docker.sh
```

### Access URLs:
- **Backend API**: http://91.184.244.196:3000
- **Admin Panel**: http://91.184.244.196:3001

### Admin Login:
- **Phone**: +919876543210
- **Password**: password123

---

**🪷 Ready for immediate deployment with real credentials!**