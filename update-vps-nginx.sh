#!/bin/bash

# Update VPS Script for Nginx Setup (Port 3000)
# This script pulls latest changes, rebuilds, and deploys to nginx

echo "🔄 Starting VPS update (Nginx setup)..."

# Navigate to project directory
cd /var/www/html/Power-Plus-Gym-Management-System-V || {
    echo "❌ Error: Project directory not found!"
    exit 1
}

echo "📥 Pulling latest changes from git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Error: Git pull failed!"
    exit 1
fi

echo "🔨 Building frontend..."
npm run build:frontend

if [ $? -ne 0 ]; then
    echo "❌ Error: Frontend build failed!"
    exit 1
fi

echo "🚀 Deploying to Nginx directory (/var/www/app3000/)..."
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to copy files to nginx directory!"
    exit 1
fi

echo "🔨 Building backend..."
cd gym-backend
npm run build

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Backend build failed, but continuing..."
fi

echo "🔄 Restarting backend service..."
pm2 restart gym-api

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 restart failed, trying to start..."
    pm2 start dist/server.js --name gym-api
    pm2 save
fi

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

if [ $? -ne 0 ]; then
    echo "❌ Error: Nginx reload failed!"
    echo "   Try: sudo nginx -t (to check config)"
    exit 1
fi

echo ""
echo "✅ Update complete!"
echo ""
echo "📊 Checking service status..."
pm2 status

echo ""
echo "🧪 Testing API..."
curl -s http://localhost:4000/api/health | head -1

echo ""
echo "✅ Files deployed to: /var/www/app3000/"
echo "🌐 Visit: http://167.172.90.182:3000"
echo ""
echo "⚠️  IMPORTANT: Clear browser cache or use Incognito mode!"
echo "   Press Ctrl+Shift+R for hard refresh"

