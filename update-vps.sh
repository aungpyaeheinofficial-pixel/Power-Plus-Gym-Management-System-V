#!/bin/bash

# Update VPS Script
# This script pulls latest changes and rebuilds the application

echo "🔄 Starting VPS update..."

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

echo "🔨 Building backend..."
cd gym-backend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Backend build failed!"
    exit 1
fi

echo "🔄 Restarting backend service..."
pm2 restart gym-api

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 restart failed, trying to start..."
    pm2 start dist/server.js --name gym-api
    pm2 save
fi

echo "✅ Update complete!"
echo ""
echo "📊 Checking service status..."
pm2 status

echo ""
echo "🧪 Testing API..."
curl -s http://localhost:4000/api/health | head -1

echo ""
echo "🎉 Done! Visit http://167.172.90.182:4000 to see the changes"

