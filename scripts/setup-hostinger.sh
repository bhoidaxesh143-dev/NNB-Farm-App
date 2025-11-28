#!/bin/bash

# Hostinger VPS Setup Script
# This script automates the initial setup of the MERN application on Hostinger Cloud Starter

set -e  # Exit on error

echo "🚀 MERN App - Hostinger VPS Setup Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo bash setup-hostinger.sh"
    exit 1
fi

# Get configuration
read -p "Enter application user name (default: mernapp): " APP_USER
APP_USER=${APP_USER:-mernapp}

read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Domain name is required"
    exit 1
fi

read -p "Enter your email for SSL certificate: " SSL_EMAIL
if [ -z "$SSL_EMAIL" ]; then
    echo "❌ Email is required for SSL certificate"
    exit 1
fi

read -p "Enter Git repository URL: " GIT_REPO
if [ -z "$GIT_REPO" ]; then
    echo "❌ Git repository URL is required"
    exit 1
fi

echo ""
echo "Configuration:"
echo "  User: $APP_USER"
echo "  Domain: $DOMAIN_NAME"
echo "  Email: $SSL_EMAIL"
echo "  Repository: $GIT_REPO"
echo ""
read -p "Continue with setup? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Setup cancelled"
    exit 0
fi

echo ""
echo "📦 Step 1/10: Updating system..."
apt update
apt upgrade -y

echo ""
echo "🔧 Step 2/10: Installing essential tools..."
apt install -y curl wget git build-essential ufw

echo ""
echo "👤 Step 3/10: Creating application user..."
if id "$APP_USER" &>/dev/null; then
    echo "User $APP_USER already exists"
else
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG sudo $APP_USER
    echo "$APP_USER ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$APP_USER
fi

echo ""
echo "🔥 Step 4/10: Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo ""
echo "📦 Step 5/10: Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo ""
echo "🗄️ Step 6/10: Installing MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo ""
echo "🔴 Step 7/10: Installing Redis..."
apt install -y redis-server
systemctl start redis
systemctl enable redis

echo ""
echo "🌐 Step 8/10: Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo ""
echo "🔄 Step 9/10: Installing PM2..."
npm install -g pm2

echo ""
echo "📥 Step 10/10: Cloning application..."
mkdir -p /var/www
chown $APP_USER:$APP_USER /var/www
cd /var/www
sudo -u $APP_USER git clone $GIT_REPO mern-app

echo ""
echo "🔧 Configuring MongoDB..."
MONGO_APP_PASSWORD=$(openssl rand -base64 32)
MONGO_ADMIN_PASSWORD=$(openssl rand -base64 32)

# Save passwords to file
cat > /var/www/mern-app/.credentials << EOF
MongoDB Admin Password: $MONGO_ADMIN_PASSWORD
MongoDB App Password: $MONGO_APP_PASSWORD
EOF
chown $APP_USER:$APP_USER /var/www/mern-app/.credentials
chmod 600 /var/www/mern-app/.credentials

# Configure MongoDB users
mongosh --eval "
use admin;
db.createUser({
  user: 'admin',
  pwd: '$MONGO_ADMIN_PASSWORD',
  roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }]
});

use mern-app;
db.createUser({
  user: 'mernappuser',
  pwd: '$MONGO_APP_PASSWORD',
  roles: [{ role: 'readWrite', db: 'mern-app' }]
});
"

# Enable MongoDB authentication
sed -i 's/#security:/security:\n  authorization: enabled/' /etc/mongod.conf
systemctl restart mongod

echo ""
echo "🔧 Configuring Redis..."
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "Redis Password: $REDIS_PASSWORD" >> /var/www/mern-app/.credentials

# Configure Redis password
sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl restart redis

echo ""
echo "🔧 Configuring environment..."
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

cat > /var/www/mern-app/server/.env << EOF
NODE_ENV=production
PORT=5000
API_VERSION=v1

MONGODB_URI=mongodb://mernappuser:${MONGO_APP_PASSWORD}@localhost:27017/mern-app?authSource=mern-app
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_TTL=3600

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=https://$DOMAIN_NAME

LOG_LEVEL=info
LOG_FILE_ENABLED=true

BCRYPT_ROUNDS=12

DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
EOF

cat > /var/www/mern-app/client/.env << EOF
VITE_API_URL=https://$DOMAIN_NAME/api/v1
EOF

chown $APP_USER:$APP_USER /var/www/mern-app/server/.env
chown $APP_USER:$APP_USER /var/www/mern-app/client/.env
chmod 600 /var/www/mern-app/server/.env

echo ""
echo "📦 Installing application dependencies..."
cd /var/www/mern-app/server
sudo -u $APP_USER npm ci --only=production

cd /var/www/mern-app/client
sudo -u $APP_USER npm ci
sudo -u $APP_USER npm run build

echo ""
echo "🚀 Starting application with PM2..."
cd /var/www/mern-app/server
sudo -u $APP_USER pm2 start src/index.js --name mern-server
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
sudo -u $APP_USER pm2 save

echo ""
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/mern-app << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    location / {
        root /var/www/mern-app/client/dist;
        try_files $uri $uri/ /index.html;
    }

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

    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    location /readiness {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/mern-app/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN_NAME/g" /etc/nginx/sites-available/mern-app

ln -sf /etc/nginx/sites-available/mern-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo ""
echo "🔒 Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email $SSL_EMAIL --redirect

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Important Information:"
echo "========================="
echo ""
echo "🌐 Your application is available at: https://$DOMAIN_NAME"
echo "🔐 Credentials saved in: /var/www/mern-app/.credentials"
echo "👤 Application user: $APP_USER"
echo ""
echo "📝 Useful commands:"
echo "  su - $APP_USER              # Switch to application user"
echo "  pm2 status                  # Check application status"
echo "  pm2 logs mern-server        # View application logs"
echo "  pm2 restart mern-server     # Restart application"
echo ""
echo "🔧 Next steps:"
echo "  1. Review credentials: cat /var/www/mern-app/.credentials"
echo "  2. Test application: curl https://$DOMAIN_NAME/api/v1/health"
echo "  3. Register first user at: https://$DOMAIN_NAME/register"
echo "  4. Set up automated backups (see HOSTINGER_DEPLOYMENT.md)"
echo ""
echo "📚 Full documentation: /var/www/mern-app/HOSTINGER_DEPLOYMENT.md"
echo ""

