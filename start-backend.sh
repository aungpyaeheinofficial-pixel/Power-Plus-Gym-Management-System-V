#!/bin/bash

# Quick script to start backend API on droplet

cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing..."
    sudo npm install -g pm2
fi

echo "🔨 Building backend..."
npm run build

echo "🛑 Stopping old process (if exists)..."
pm2 delete gym-api 2>/dev/null || true

echo "🚀 Starting backend API..."
pm2 start dist/server.js --name gym-api
pm2 save

echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 View logs: pm2 logs gym-api"
echo "🌐 Test API: curl http://localhost:4000/api/health"
echo ""

# Wait a moment then test
sleep 2
echo "🧪 Testing API..."
curl http://localhost:4000/api/health || echo "❌ API not responding"

