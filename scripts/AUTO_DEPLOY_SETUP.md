# 🚀 Auto-Deploy Setup Guide

This guide shows you 3 different methods to automatically update your Docker containers when you push new code to GitHub.

## 🎯 Method 1: GitHub Actions (Recommended)

### Setup GitHub Secrets

1. Go to your GitHub repository: `https://github.com/expertcodertech/lotus365workbackend`
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

```
VPS_HOST = 91.184.244.196
VPS_USERNAME = lotus365
VPS_SSH_KEY = [Your private SSH key content]
VPS_PORT = 22
```

### How it works:
- ✅ Automatically triggers on every push to `main` branch
- ✅ Connects to your VPS via SSH
- ✅ Pulls latest code and rebuilds Docker containers
- ✅ Runs health checks
- ✅ Shows deployment status in GitHub

### Test it:
```bash
# Make any change and push
git add .
git commit -m "Test auto-deploy"
git push origin main

# Check GitHub Actions tab to see deployment progress
```

---

## 🎣 Method 2: Webhook Server (Advanced)

### 1. Setup Webhook Server on VPS

```bash
# On your VPS
cd /opt/lotus365

# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/webhook-server.js

# Install webhook service
sudo cp scripts/lotus365-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable lotus365-webhook
sudo systemctl start lotus365-webhook

# Check status
sudo systemctl status lotus365-webhook
```

### 2. Configure GitHub Webhook

1. Go to your GitHub repository settings
2. Go to **Webhooks** → **Add webhook**
3. Set:
   - **Payload URL**: `http://91.184.244.196:9000`
   - **Content type**: `application/json`
   - **Secret**: `lotus365-webhook-secret-2026`
   - **Events**: Just the push event

### 3. Test Webhook

```bash
# Check webhook server logs
sudo journalctl -u lotus365-webhook -f

# Push code and watch logs
git add .
git commit -m "Test webhook"
git push origin main
```

---

## 🔄 Method 3: Manual Check Script

### Create Auto-Update Script

```bash
# On your VPS, create a cron job
crontab -e

# Add this line to check for updates every 5 minutes
*/5 * * * * /opt/lotus365/scripts/check-updates.sh
```

Let me create the check-updates script:

---

## 📊 Monitoring Auto-Deployment

### Check Deployment Status

```bash
# Method 1: GitHub Actions
# Check: https://github.com/expertcodertech/lotus365workbackend/actions

# Method 2: Webhook Logs
sudo journalctl -u lotus365-webhook -f

# Method 3: Manual Check
tail -f /var/log/lotus365-deploy.log
```

### Health Checks

```bash
# Check if containers are running
docker-compose ps

# Check application health
curl http://localhost:3002/v1/health
curl http://localhost:3003

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🛠️ Troubleshooting

### Common Issues

1. **SSH Connection Failed (Method 1)**
   ```bash
   # Generate SSH key on your local machine
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   
   # Copy public key to VPS
   ssh-copy-id lotus365@91.184.244.196
   
   # Add private key content to GitHub secrets
   cat ~/.ssh/id_rsa
   ```

2. **Webhook Not Triggering (Method 2)**
   ```bash
   # Check if webhook server is running
   sudo systemctl status lotus365-webhook
   
   # Check firewall
   sudo ufw allow 9000
   
   # Check webhook server logs
   sudo journalctl -u lotus365-webhook -n 50
   ```

3. **Docker Build Fails**
   ```bash
   # Check Docker logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Manual rebuild
   docker-compose down
   docker-compose up -d --build
   ```

### Emergency Rollback

```bash
# If deployment fails, rollback to previous version
cd /opt/lotus365
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>
docker-compose down
docker-compose up -d --build
```

---

## ✅ Recommended Setup

**For Production**: Use **Method 1 (GitHub Actions)** - it's the most reliable and provides the best visibility.

**For Advanced Users**: Use **Method 2 (Webhook)** if you want more control and faster deployments.

**For Simple Setups**: Use **Method 3 (Cron Job)** for basic periodic checks.

---

## 🎉 Success Indicators

When auto-deployment is working correctly, you'll see:

✅ **GitHub Actions**: Green checkmarks in the Actions tab  
✅ **Webhook**: Success messages in webhook logs  
✅ **Health Checks**: Both backend and frontend responding  
✅ **Container Status**: All containers running and healthy  
✅ **Application**: Admin panel showing latest changes  

Your Lotus365 platform will now automatically update whenever you push code to GitHub!