# 🪷 Lotus365 Work Platform

A complete trading and earning platform with NestJS backend API and Next.js admin panel.

## 📁 Project Structure

```
├── backend/          # NestJS API server
├── frontend/         # Next.js admin panel
├── docker-compose.yml
├── nginx.conf
└── deploy.sh
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### 1. Clone Repository
```bash
git clone https://github.com/expertcodertech/lotus365workbackend.git
cd lotus365workbackend
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

## 🌐 VPS Production Deployment

### Option 1: Docker Deployment (Recommended)

#### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group changes
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/expertcodertech/lotus365workbackend.git
cd lotus365workbackend

# Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment files
nano backend/.env
nano frontend/.env.local

# Update domain names in nginx.conf
nano nginx.conf

# Make deploy script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment with PM2

#### Step 1: Install Dependencies
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Deploy Backend
```bash
cd backend
npm install
npm run build
pm2 start dist/main.js --name "lotus365-backend"
pm2 save
pm2 startup
```

#### Step 3: Deploy Frontend
```bash
cd frontend
npm install
npm run build
pm2 start npm --name "lotus365-frontend" -- start
pm2 save
```

#### Step 4: Configure Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/lotus365
sudo ln -s /etc/nginx/sites-available/lotus365 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=lotus365_work

# JWT Configuration (IMPORTANT: Change these!)
JWT_ACCESS_SECRET=your-super-secure-access-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret

# App Configuration
PORT=3000
NODE_ENV=production
```

### Frontend Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
```

### Domain Configuration

Update `nginx.conf` with your domains:
- Backend API: `api.your-domain.com`
- Admin Panel: `admin.your-domain.com`

## 🗄️ Database Setup

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE lotus365_work;

-- Create user
CREATE USER lotus365_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lotus365_work TO lotus365_user;
```

The application will automatically create tables on first run.

## 🔐 Admin Access

### Create Admin User

1. **Register a user through API:**
```bash
curl -X POST http://your-domain.com:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "fullName": "Admin User",
    "password": "your_secure_password"
  }'
```

2. **Make user admin in database:**
```sql
UPDATE users SET role = 'admin' WHERE phone = '+919876543210';
```

3. **Login to admin panel:**
- URL: http://admin.your-domain.com
- Phone: +919876543210
- Password: your_secure_password

## 📊 API Endpoints

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh-token` - Refresh JWT token

### User Management
- `GET /v1/users/me` - Get user profile
- `PATCH /v1/users/me` - Update user profile

### Wallet & Transactions
- `GET /v1/wallet` - Get wallet balance
- `POST /v1/transactions/buy` - Create buy order
- `POST /v1/transactions/sell` - Create sell order
- `GET /v1/transactions/history` - Transaction history

### Withdrawals
- `POST /v1/withdrawals` - Request withdrawal
- `GET /v1/withdrawals` - Get withdrawal history

### Admin Endpoints
- `GET /v1/admin/dashboard` - Admin dashboard data
- `GET /v1/admin/users` - Manage users
- `GET /v1/admin/transactions` - View all transactions
- `GET /v1/admin/withdrawals` - Manage withdrawals

## 🔒 Security Features

- JWT authentication with refresh tokens
- Rate limiting and throttling
- Input validation with class-validator
- SQL injection protection with TypeORM
- CORS configuration
- Password hashing with bcrypt
- Environment-based configuration

## 📈 Monitoring & Health Checks

### Health Check Endpoints
- Backend: `GET /v1/config/app-version`
- Database status included in API responses

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2 logs
pm2 logs lotus365-backend
pm2 logs lotus365-frontend
```

### Service Status
```bash
# Docker
docker-compose ps

# PM2
pm2 status
```

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

### Database Migrations
```bash
cd backend
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **CORS Errors**
   - Update CORS origins in `backend/src/main.ts`
   - Check frontend API URL configuration

3. **JWT Token Issues**
   - Verify JWT secrets are set in `.env`
   - Check token expiration settings

4. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   sudo lsof -t -i tcp:3000 | xargs kill -9
   
   # Kill process on port 3001
   sudo lsof -t -i tcp:3001 | xargs kill -9
   ```

5. **Docker Issues**
   ```bash
   # Clean up Docker
   docker-compose down -v
   docker system prune -a
   
   # Rebuild containers
   docker-compose up -d --build
   ```

### Support Commands
```bash
# Check service status
systemctl status nginx
systemctl status postgresql

# View logs
journalctl -u nginx -f
tail -f /var/log/postgresql/postgresql-*.log

# Test API connectivity
curl -I http://localhost:3000/v1/config/app-version
curl -I http://localhost:3001
```

## 📱 Android App Integration

The Android app should be configured with these URLs:
- **Debug**: `http://10.0.2.2:3000/v1/` (for emulator)
- **Production**: `https://api.your-domain.com/v1/`

## 🔄 Updates & Maintenance

### Updating the Application
```bash
git pull origin main
./deploy.sh
```

### Database Backup
```bash
pg_dump -h localhost -U lotus365_user lotus365_work > backup.sql
```

### SSL Certificate Setup (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com -d admin.your-domain.com
```

## 📄 License

Private - All rights reserved.

---

**Lotus365 Work Platform © 2026**

For support and issues, please check the troubleshooting section or review the application logs.