#!/bin/bash

# Start both frontend and backend services automatically
# Run this on your DigitalOcean droplet

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "🔨 Building backend..."
cd gym-backend
npm install
npm run build
cd ..

echo "🔨 Building frontend..."
npm install
npm run build:frontend

echo "🚀 Starting services with PM2..."

# Start backend API
cd gym-backend
pm2 start dist/server.js --name gym-api --env production
pm2 save

cd ..

echo "✅ Services started!"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs"
echo "🔄 Restart: pm2 restart all"
echo ""
echo "🌐 Backend API: http://YOUR_IP:4000/api"
echo "🌐 Frontend: http://YOUR_IP (served by Nginx)"

