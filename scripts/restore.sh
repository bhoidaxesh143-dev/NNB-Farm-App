#!/bin/bash

# Database Restore Script for MongoDB
# Restores MongoDB database from backup

set -e  # Exit on error

# Configuration
BACKUP_DIR="/var/www/mern-app/backups"

# MongoDB Configuration (update these values)
MONGODB_USER="mernappuser"
MONGODB_PASSWORD="YOUR_MONGODB_PASSWORD"  # Change this!
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="mern-app"
MONGODB_AUTH_DB="mern-app"

# Construct MongoDB URI
MONGODB_URI="mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}?authSource=${MONGODB_AUTH_DB}"

echo "🔄 MongoDB Database Restore"
echo "=========================="
echo ""

# List available backups
echo "📋 Available backups:"
ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null || (echo "❌ No backups found in $BACKUP_DIR" && exit 1)
echo ""

# Prompt for backup file
read -p "Enter backup filename (e.g., 20250128_140000.tar.gz): " BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Confirmation
echo ""
echo "⚠️ WARNING: This will REPLACE all data in database: $MONGODB_DB"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Stop application
echo ""
echo "🛑 Stopping application..."
pm2 stop mern-server || echo "Application not running"

# Extract backup
echo "📦 Extracting backup..."
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory (timestamp directory inside)
BACKUP_SUBDIR=$(ls -d $TEMP_DIR/*/ | head -n 1)

# Restore database
echo "🔄 Restoring database..."
mongorestore --uri="$MONGODB_URI" --drop "$BACKUP_SUBDIR" --quiet

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully"
else
    echo "❌ Database restore failed"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

# Restart application
echo "♻️ Starting application..."
pm2 start mern-server

# Wait for app to start
sleep 3

# Check health
echo "🏥 Running health check..."
HEALTH_URL="http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Restore complete! Application is healthy."
else
    echo "⚠️ Warning: Health check returned HTTP $RESPONSE"
    echo "   Check logs: pm2 logs mern-server"
fi

echo ""
echo "📊 Application status:"
pm2 status mern-server

