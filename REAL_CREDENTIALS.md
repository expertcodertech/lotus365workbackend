# 🔐 REAL PRODUCTION CREDENTIALS

## 📊 Database Configuration (Supabase)

```env
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_USERNAME=postgres.zdqxygisywmjoeimjflc
DB_PASSWORD="wBJs/y?P!d.%U6w"
DB_NAME=postgres
DB_SSL=true
```

## 🔑 JWT Secrets (Production Ready)

```env
JWT_ACCESS_SECRET=lotus365-access-secret-production-2026-secure-key-12345
JWT_REFRESH_SECRET=lotus365-refresh-secret-production-2026-secure-key-67890
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

## ⚙️ App Configuration

```env
PORT=3000
NODE_ENV=production
```

## 🚀 Quick Deployment

### 1. Copy Real Environment File
```bash
# Backend
cp backend/.env.example backend/.env
# No need to edit - real credentials already included!

# Frontend  
cp frontend/.env.example frontend/.env.local
# Edit with your server IP: NEXT_PUBLIC_API_URL=http://your-server-ip:3000/v1
```

### 2. Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## 👤 Admin User (Already Created)

- **Phone**: `+919876543210`
- **Password**: `password123`
- **Role**: `admin`

## 🌐 Database Status

✅ **Database is LIVE and WORKING**
✅ **Tables already created**
✅ **Admin user already exists**
✅ **App configuration loaded**

## 📱 Android App Configuration

Update your Android app with:
```kotlin
buildConfigField("String", "BASE_URL", "\"http://your-server-ip:3000/v1/\"")
```

---

**🪷 Ready for immediate deployment with real, working credentials!**