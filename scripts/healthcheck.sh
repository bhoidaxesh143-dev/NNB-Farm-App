#!/bin/bash

# Health Check Script
# Monitors application health and automatically restarts if needed

set -e  # Exit on error

# Configuration
API_URL="http://localhost:5000/health"
MAX_RETRIES=3
RETRY_DELAY=5

echo "🏥 Running health check..."

# Function to check health
check_health() {
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null)
    return $RESPONSE
}

# Try health check with retries
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if check_health && [ $? -eq 200 ]; then
        echo "✅ Application is healthy (HTTP 200)"
        
        # Show PM2 status
        pm2 describe mern-server --silent > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="mern-server") | .pm2_env.pm_uptime' | xargs -I {} date -d @{} "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
            MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="mern-server") | .monit.memory' | numfmt --to=iec 2>/dev/null || echo "unknown")
            CPU=$(pm2 jlist | jq -r '.[] | select(.name=="mern-server") | .monit.cpu' 2>/dev/null || echo "unknown")
            
            echo "📊 Memory: $MEMORY | CPU: ${CPU}% | Uptime: Since $UPTIME"
        fi
        
        exit 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "⚠️ Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES), retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    fi
done

# Health check failed after all retries
echo "❌ Application is unhealthy after $MAX_RETRIES attempts"
echo "🔄 Attempting to restart application..."

# Check PM2 status
pm2 describe mern-server > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "♻️ Restarting with PM2..."
    pm2 restart mern-server
    
    # Wait for restart
    sleep 5
    
    # Check health again
    if check_health && [ $? -eq 200 ]; then
        echo "✅ Application restarted successfully and is now healthy"
        exit 0
    else
        echo "❌ Application still unhealthy after restart"
        echo "📝 Recent logs:"
        pm2 logs mern-server --lines 20 --nostream
        exit 1
    fi
else
    echo "❌ Application not found in PM2"
    echo "🔧 Try starting manually: pm2 start /var/www/mern-app/server/src/index.js --name mern-server"
    exit 1
fi

