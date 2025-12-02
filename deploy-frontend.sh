#!/bin/bash

# Script to build and deploy frontend for automatic updates
# Run this on your server after making code changes

echo "========================================="
echo "  Deploying Frontend for Auto-Updates"
echo "========================================="
echo ""

# Navigate to project directory
cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "[1/3] Building frontend..."
npm run build:frontend

if [ $? -ne 0 ]; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi

echo "✓ Frontend built successfully"
echo ""

echo "[2/3] Frontend files are ready in dist/ folder"
echo "✓ Files will be served automatically by Express server"
echo ""

echo "[3/3] Restarting backend server..."
cd gym-backend
pm2 restart gym-api || pm2 start dist/server.js --name gym-api

if [ $? -ne 0 ]; then
    echo "WARNING: Could not restart PM2. You may need to restart manually:"
    echo "  pm2 restart gym-api"
else
    echo "✓ Backend server restarted"
fi

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Your app will automatically update when users:"
echo "  1. Close and reopen the app, OR"
echo "  2. Pull down to refresh (if implemented)"
echo ""
echo "No need to rebuild APK for code changes! 🎉"
echo ""

