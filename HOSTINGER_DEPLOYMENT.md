# Hostinger Cloud Starter Deployment Guide

Complete guide to deploy the MERN application on Hostinger Cloud Starter VPS.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial VPS Setup](#initial-vps-setup)
3. [Install Required Software](#install-required-software)
4. [Deploy Application](#deploy-application)
5. [Configure Domain & SSL](#configure-domain--ssl)
6. [Application Management](#application-management)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### What You Need

- **Hostinger Cloud Starter VPS** (or higher tier)
- **Domain name** (can be purchased from Hostinger or external registrar)
- **SSH access** to your VPS
- **Basic terminal knowledge**

### Hostinger Cloud Starter Specs
- 2 vCPU cores
- 4 GB RAM
- 100 GB NVMe Storage
- Ubuntu 22.04 LTS (recommended)

## Initial VPS Setup

### Step 1: Access Your VPS

```bash
# SSH into your VPS (get credentials from Hostinger control panel)
ssh root@your-server-ip

# Example:
# ssh root@123.456.789.012
```

### Step 2: Create Non-Root User

```bash
# Create new user
adduser mernapp

# Add to sudo group
usermod -aG sudo mernapp

# Switch to new user
su - mernapp
```

### Step 3: Update System

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 4: Configure Firewall

```bash
# Install UFW (if not installed)
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Install Required Software

### Step 1: Install Node.js

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 2: Install MongoDB

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

### Step 3: Configure MongoDB Security

```bash
# Connect to MongoDB
mongosh

# Create admin user (in mongosh)
use admin
db.createUser({
  user: "admin",
  pwd: "CHANGE_THIS_STRONG_PASSWORD",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

# Create application database and user
use mern-app
db.createUser({
  user: "mernappuser",
  pwd: "CHANGE_THIS_STRONG_PASSWORD",
  roles: [{ role: "readWrite", db: "mern-app" }]
})

# Exit mongosh
exit
```

```bash
# Enable authentication
sudo nano /etc/mongod.conf

# Add these lines under security:
# security:
#   authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

### Step 4: Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Find and change these lines:
# supervised systemd
# requirepass YOUR_STRONG_REDIS_PASSWORD

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Test Redis
redis-cli
# In redis-cli:
AUTH YOUR_STRONG_REDIS_PASSWORD
ping  # Should return PONG
exit
```

### Step 5: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Step 6: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

## Deploy Application

### Step 1: Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www
sudo chown mernapp:mernapp /var/www

# Clone your repository
cd /var/www
git clone <your-repository-url> mern-app
cd mern-app
```

### Step 2: Configure Environment Variables

```bash
# Server configuration
cd /var/www/mern-app/server
cp .env.example .env
nano .env
```

**Edit server `.env` with your production values:**

```bash
NODE_ENV=production
PORT=5000
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://mernappuser:YOUR_MONGODB_PASSWORD@localhost:27017/mern-app?authSource=mern-app

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_TTL=3600

# JWT Configuration - GENERATE STRONG SECRETS!
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_REFRESH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# Security
BCRYPT_ROUNDS=12

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

**Generate strong secrets:**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Client configuration:**
```bash
cd /var/www/mern-app/client
cp .env.example .env
nano .env
```

```bash
VITE_API_URL=https://yourdomain.com/api/v1
```

### Step 3: Install Dependencies

```bash
# Install server dependencies
cd /var/www/mern-app/server
npm ci --only=production

# Install client dependencies and build
cd /var/www/mern-app/client
npm ci
npm run build
```

### Step 4: Start Server with PM2

```bash
cd /var/www/mern-app/server

# Start application with PM2
pm2 start src/index.js --name mern-server

# Configure PM2 to start on system boot
pm2 startup systemd
# Copy and run the command that PM2 outputs

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs mern-server
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mern-app
```

**Add this configuration:**

```nginx
# Redirect HTTP to HTTPS (will be enabled after SSL setup)
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Temporarily serve the app (comment out after SSL setup)
    location / {
        root /var/www/mern-app/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health checks
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    location /readiness {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/mern-app/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mern-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Configure Domain & SSL

### Step 1: Configure DNS

**In Hostinger Control Panel (or your DNS provider):**

1. Go to **DNS/Nameservers**
2. Add/Update A records:

```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      3600
A       www     YOUR_SERVER_IP      3600
```

3. Wait for DNS propagation (5-30 minutes)

**Verify DNS:**
```bash
# Check if domain resolves to your server
dig yourdomain.com +short
# Should return your server IP
```

### Step 2: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

**Certbot will automatically update your Nginx configuration to use HTTPS.**

### Step 3: Update CORS Origin

```bash
# Update server .env
cd /var/www/mern-app/server
nano .env

# Change CORS_ORIGIN to:
CORS_ORIGIN=https://yourdomain.com

# Restart server
pm2 restart mern-server
```

### Step 4: Verify Deployment

```bash
# Check server is running
pm2 status

# Check server logs
pm2 logs mern-server

# Test API
curl https://yourdomain.com/api/v1/health

# Check SSL
curl -I https://yourdomain.com
```

**Visit your domain:**
- https://yourdomain.com - Should show the React app
- https://yourdomain.com/api/v1/health - Should return JSON

## Application Management

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs mern-server
pm2 logs mern-server --lines 100

# Restart app
pm2 restart mern-server

# Stop app
pm2 stop mern-server

# Start app
pm2 start mern-server

# Delete from PM2
pm2 delete mern-server

# Monitor
pm2 monit
```

### Update Deployment

```bash
# Create deployment script
nano /var/www/mern-app/deploy.sh
```

**Add this script:**

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /var/www/mern-app

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Update server
echo "🔧 Updating server..."
cd server
npm ci --only=production

# Update and build client
echo "🎨 Building client..."
cd ../client
npm ci
npm run build

# Restart server
echo "♻️ Restarting server..."
pm2 restart mern-server

# Check status
pm2 status

echo "✅ Deployment complete!"
echo "🔍 Check logs with: pm2 logs mern-server"
```

```bash
# Make executable
chmod +x /var/www/mern-app/deploy.sh

# Run deployment
cd /var/www/mern-app
./deploy.sh
```

### Database Backup Script

```bash
# Create backup directory
mkdir -p /var/www/mern-app/backups

# Create backup script
nano /var/www/mern-app/backup.sh
```

**Add this script:**

```bash
#!/bin/bash

BACKUP_DIR="/var/www/mern-app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MONGODB_URI="mongodb://mernappuser:YOUR_PASSWORD@localhost:27017/mern-app?authSource=mern-app"

echo "📦 Creating backup..."

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$TIMESTAMP"

# Compress backup
cd $BACKUP_DIR
tar -czf "$TIMESTAMP.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"

# Keep only last 7 backups
ls -t *.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup complete: $TIMESTAMP.tar.gz"
```

```bash
# Make executable
chmod +x /var/www/mern-app/backup.sh

# Test backup
cd /var/www/mern-app
./backup.sh

# Schedule daily backups (crontab)
crontab -e

# Add this line (daily at 2 AM):
0 2 * * * /var/www/mern-app/backup.sh >> /var/www/mern-app/backups/backup.log 2>&1
```

## Monitoring & Maintenance

### Install Monitoring Tools

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor system resources
htop
```

### Setup Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Create Health Check Script

```bash
nano /var/www/mern-app/healthcheck.sh
```

```bash
#!/bin/bash

API_URL="https://yourdomain.com/api/v1/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application is down (HTTP $RESPONSE)"
    echo "🔄 Restarting application..."
    pm2 restart mern-server
    exit 1
fi
```

```bash
chmod +x /var/www/mern-app/healthcheck.sh

# Schedule health check (every 5 minutes)
crontab -e

# Add:
*/5 * * * * /var/www/mern-app/healthcheck.sh >> /var/www/mern-app/healthcheck.log 2>&1
```

### Monitor Disk Space

```bash
# Check disk usage
df -h

# Check largest directories
du -sh /var/www/mern-app/*
du -sh /var/log/*
```

### Security Updates

```bash
# Create update script
nano /var/www/mern-app/security-update.sh
```

```bash
#!/bin/bash

echo "🔒 Running security updates..."

# Update system packages
sudo apt update
sudo apt upgrade -y

# Update npm packages
cd /var/www/mern-app/server
npm audit fix --only=prod

cd /var/www/mern-app/client
npm audit fix --only=prod

echo "✅ Security updates complete"
```

```bash
chmod +x /var/www/mern-app/security-update.sh

# Schedule weekly updates (Sunday at 3 AM)
sudo crontab -e

# Add:
0 3 * * 0 /var/www/mern-app/security-update.sh >> /var/www/mern-app/security-update.log 2>&1
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs mern-server --lines 50

# Check if port is in use
sudo lsof -i :5000

# Check MongoDB connection
mongosh "mongodb://mernappuser:PASSWORD@localhost:27017/mern-app?authSource=mern-app"

# Check Redis connection
redis-cli -a YOUR_REDIS_PASSWORD ping

# Restart services
sudo systemctl restart mongod
sudo systemctl restart redis
pm2 restart mern-server
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

### Database Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod

# Test connection
mongosh "mongodb://mernappuser:PASSWORD@localhost:27017/mern-app?authSource=mern-app"
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Restart Nginx after renewal
sudo systemctl reload nginx
```

### Out of Memory

```bash
# Check memory usage
free -h

# Check top processes
htop

# Restart application
pm2 restart mern-server

# Add swap space if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### High CPU Usage

```bash
# Check process CPU usage
top

# Check PM2 metrics
pm2 monit

# Check application logs for errors
pm2 logs mern-server
```

## Performance Optimization

### Enable Nginx Caching

```bash
sudo nano /etc/nginx/nginx.conf

# Add inside http block:
# proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# In your site config, add to API location:
# proxy_cache api_cache;
# proxy_cache_valid 200 5m;
# proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
```

### Optimize PM2

```bash
# Run in cluster mode (uses all CPU cores)
pm2 delete mern-server
pm2 start src/index.js --name mern-server -i max
pm2 save
```

### Database Optimization

```bash
# Create indexes (in mongosh)
use mern-app
db.users.createIndex({ email: 1 })
db.users.createIndex({ createdAt: -1 })
```

## Cost Estimation

**Hostinger Cloud Starter:**
- VPS: ~$15-25/month
- Domain: ~$10/year (if purchased from Hostinger)
- **Total: ~$15-25/month**

**Free components:**
- MongoDB (self-hosted)
- Redis (self-hosted)
- SSL Certificate (Let's Encrypt)
- PM2 (open source)

## Quick Reference Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs mern-server

# Restart application
pm2 restart mern-server

# Deploy updates
cd /var/www/mern-app && ./deploy.sh

# Backup database
cd /var/www/mern-app && ./backup.sh

# Check health
curl https://yourdomain.com/api/v1/health

# View system resources
htop

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod

# Check Redis status
sudo systemctl status redis
```

## Support

- **Hostinger Support:** https://www.hostinger.com/contact
- **Application Logs:** `/var/www/mern-app/server/logs/`
- **PM2 Logs:** `pm2 logs mern-server`
- **Nginx Logs:** `/var/log/nginx/`

## Security Best Practices

✅ Change all default passwords  
✅ Use strong JWT secrets  
✅ Enable MongoDB authentication  
✅ Set Redis password  
✅ Configure firewall (UFW)  
✅ Enable SSL/HTTPS  
✅ Regular security updates  
✅ Regular backups  
✅ Monitor logs for suspicious activity  
✅ Use non-root user for application  

---

**Congratulations!** Your MERN application is now deployed on Hostinger Cloud Starter! 🎉

