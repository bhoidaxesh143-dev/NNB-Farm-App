#!/bin/bash

# Database Backup Script for MongoDB
# Automatically backs up MongoDB database and keeps last 7 backups

set -e  # Exit on error

# Configuration
BACKUP_DIR="/var/www/mern-app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# MongoDB Configuration (update these values)
MONGODB_USER="mernappuser"
MONGODB_PASSWORD="YOUR_MONGODB_PASSWORD"  # Change this!
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="mern-app"
MONGODB_AUTH_DB="mern-app"

# Construct MongoDB URI
MONGODB_URI="mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}?authSource=${MONGODB_AUTH_DB}"

echo "📦 Starting database backup..."
echo "🕐 Timestamp: $TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "💾 Creating MongoDB dump..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$TIMESTAMP" --quiet

if [ $? -eq 0 ]; then
    echo "✅ MongoDB dump successful"
else
    echo "❌ MongoDB dump failed"
    exit 1
fi

# Compress backup
echo "🗜️ Compressing backup..."
cd $BACKUP_DIR
tar -czf "$TIMESTAMP.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"

# Get backup size
BACKUP_SIZE=$(du -h "$TIMESTAMP.tar.gz" | cut -f1)
echo "📦 Backup size: $BACKUP_SIZE"

# Clean up old backups (keep only last N backups)
echo "🧹 Cleaning up old backups (keeping last $RETENTION_DAYS)..."
ls -t *.tar.gz | tail -n +$((RETENTION_DAYS + 1)) | xargs -r rm -v

# List current backups
echo ""
echo "📋 Current backups:"
ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "No backups found"

echo ""
echo "✅ Backup complete: $BACKUP_DIR/$TIMESTAMP.tar.gz"
echo "📍 Location: $BACKUP_DIR"

