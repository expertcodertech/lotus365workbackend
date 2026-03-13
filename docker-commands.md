# 🐳 Docker Management Commands for Lotus365

## Essential Docker Commands

### 1. Container Management
```bash
# View running containers
docker-compose ps

# View all containers (including stopped)
docker ps -a

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx

# Rebuild and start (after code changes)
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### 2. Logs and Debugging
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend

# View logs with timestamps
docker-compose logs -t backend
```

### 3. Container Access
```bash
# Execute commands in running container
docker exec -it lotus365-backend-1 sh
docker exec -it lotus365-frontend-1 sh

# View container environment variables
docker exec lotus365-backend-1 env

# Check if file exists in container
docker exec lotus365-backend-1 ls -la /app/.env
```

### 4. Health Checks and Status
```bash
# Check container health
docker inspect lotus365-backend-1 | grep -A 10 Health

# Test backend health endpoint
curl http://localhost:3002/v1/health

# Test frontend
curl http://localhost:3003

# Check port bindings
docker port lotus365-backend-1
docker port lotus365-frontend-1
```

### 5. Cleanup Commands
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a

# Remove specific container
docker rm lotus365-backend-1

# Remove specific image
docker rmi lotus365-backend
```

### 6. Database and Environment
```bash
# Test database connection from backend container
docker exec lotus365-backend-1 node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"

# Check environment variables in container
docker exec lotus365-backend-1 printenv | grep JWT
docker exec lotus365-backend-1 printenv | grep DB
```

## Quick Fix Commands

### Fix JWT Secret Issue
```bash
# 1. Stop containers
docker-compose down

# 2. Update environment variables (already fixed in docker-compose.yml)
# 3. Rebuild and start
docker-compose up -d --build

# 4. Test login
curl -X POST http://localhost:3002/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","password":"password123"}'
```

### Emergency Restart
```bash
# Complete restart with rebuild
docker-compose down
docker-compose up -d --build

# If that fails, force cleanup and restart
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

## Monitoring Commands

### Real-time Monitoring
```bash
# Monitor resource usage
docker stats

# Monitor specific containers
docker stats lotus365-backend-1 lotus365-frontend-1

# Monitor logs in real-time
docker-compose logs -f
```

### Health Checks
```bash
# Backend health
curl -f http://localhost:3002/v1/health && echo "✅ Backend OK" || echo "❌ Backend Failed"

# Frontend health  
curl -f http://localhost:3003 && echo "✅ Frontend OK" || echo "❌ Frontend Failed"

# Test login endpoint
curl -X POST http://localhost:3002/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","password":"password123"}' \
  && echo "✅ Login OK" || echo "❌ Login Failed"
```