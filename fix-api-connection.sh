#!/bin/bash

# Quick fix script for API connection refused error
# Run this on your server: bash fix-api-connection.sh

echo "========================================="
echo "  Fixing API Connection Issue"
echo "========================================="
echo ""

# Navigate to project
cd /var/www/html/Power-Plus-Gym-Management-System-V || {
    echo "ERROR: Cannot find project directory!"
    exit 1
}

echo "[1/5] Checking current PM2 status..."
pm2 status

echo ""
echo "[2/5] Stopping old backend (if running)..."
pm2 delete gym-api 2>/dev/null || echo "No existing process to stop"

echo ""
echo "[3/5] Installing dependencies..."
cd gym-backend
npm install

echo ""
echo "[4/5] Building backend..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed! Check the errors above."
    exit 1
fi

echo ""
echo "[5/5] Starting backend with PM2..."
pm2 start dist/server.js --name gym-api
pm2 save

echo ""
echo "========================================="
echo "  Checking Server Status"
echo "========================================="
echo ""

# Wait a moment for server to start
sleep 2

# Check PM2 status
echo "PM2 Status:"
pm2 status

echo ""
echo "Testing API locally..."
if curl -s http://localhost:4000/api/health > /dev/null; then
    echo "✅ API is responding on localhost:4000"
else
    echo "❌ API is NOT responding on localhost:4000"
    echo "Check logs: pm2 logs gym-api"
fi

echo ""
echo "Checking if port 4000 is listening..."
if sudo netstat -tlnp | grep -q ':4000'; then
    echo "✅ Port 4000 is listening"
    sudo netstat -tlnp | grep ':4000'
else
    echo "❌ Port 4000 is NOT listening"
fi

echo ""
echo "========================================="
echo "  Next Steps"
echo "========================================="
echo ""
echo "1. View logs: pm2 logs gym-api"
echo "2. Test API: curl http://localhost:4000/api/health"
echo "3. Test from browser: http://167.172.90.182:4000/api/health"
echo ""
echo "If still not accessible, check firewall:"
echo "  sudo ufw allow 4000/tcp"
echo ""

