#!/bin/bash

# MERN Application Deployment Script for Hostinger
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting MERN App Deployment..."

# Configuration
APP_DIR="/var/www/mern-app"
BRANCH="main"

# Check if running as correct user
if [ "$USER" == "root" ]; then
    echo "❌ Do not run this script as root!"
    echo "   Switch to your application user: su - mernapp"
    exit 1
fi

# Navigate to app directory
cd $APP_DIR

# Pull latest code
echo "📥 Pulling latest code from $BRANCH branch..."
git fetch origin
git reset --hard origin/$BRANCH

# Update server dependencies
echo "🔧 Updating server dependencies..."
cd $APP_DIR/server
npm ci --only=production

# Update and build client
echo "🎨 Building client application..."
cd $APP_DIR/client
npm ci
npm run build

# Restart server with PM2
echo "♻️ Restarting server..."
pm2 restart mern-server

# Wait a moment for the server to start
sleep 3

# Check server status
echo "🔍 Checking server status..."
pm2 list

# Health check
echo "🏥 Running health check..."
HEALTH_URL="http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Deployment successful! Server is healthy."
    echo ""
    echo "📊 Server Status:"
    pm2 status mern-server
    echo ""
    echo "📝 View logs: pm2 logs mern-server"
    echo "🌐 Visit: https://yourdomain.com"
else
    echo "⚠️ Warning: Health check returned HTTP $RESPONSE"
    echo "   Check logs: pm2 logs mern-server"
    exit 1
fi

