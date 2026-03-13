# 🪷 Lotus365 Work - Earning Platform

A complete full-stack earning platform with Android app, admin panel, and backend API.

**🚀 Auto-Deploy Status: ACTIVE** - Updates automatically on every push!

## 📁 Project Structure

```
lotus365-clean/
├── backend/          # NestJS API Server
├── frontend/         # Next.js Admin Panel  
├── nginx/           # Nginx Configuration
├── scripts/         # Deployment Scripts
├── .github/         # CI/CD Workflows
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Git

### Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/expertcodertech/lotus365workbackend.git
cd lotus365workbackend
```

2. **Start Services**
```bash
docker-compose up -d --build
```

3. **Access Applications**
- Backend API: http://localhost:3002
- Admin Panel: http://localhost:3003
- API Documentation: http://localhost:3002/api

### Production Deployment

```bash
# Run deployment script
./scripts/deploy.sh
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
- Database: Supabase PostgreSQL
- JWT: Ultra-secure 64-byte secrets
- CORS: Configured for production

**Frontend (.env.local)**
- API URL: Points to backend server
- Environment: Production ready

## 📱 Components

### Backend API (NestJS)
- Authentication & Authorization
- User Management
- Transaction Processing
- Admin Dashboard APIs
- Real-time Features

### Admin Panel (Next.js)
- User Management Interface
- Transaction Monitoring
- Analytics Dashboard
- System Configuration

### Android App
- User Registration/Login
- Earning Activities
- Wallet Management
- Referral System

## 🔐 Security Features

- Ultra-secure JWT tokens (64-byte cryptographic)
- Password hashing with bcrypt
- Rate limiting & throttling
- CORS protection
- SQL injection prevention
- Input validation & sanitization

## 📊 Database Schema

- Users with wallet system
- Transaction tracking
- Referral management
- Admin configurations
- Analytics data

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: Next.js, React, Tailwind CSS
- **Mobile**: Android (Kotlin), Jetpack Compose
- **Infrastructure**: Docker, Nginx, GitHub Actions
- **Database**: Supabase PostgreSQL

## 📞 Support

For technical support or questions, contact the development team.

---
**© 2026 Lotus365 Work Platform**