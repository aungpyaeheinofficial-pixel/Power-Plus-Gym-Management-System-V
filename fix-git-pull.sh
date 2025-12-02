#!/bin/bash

# Fix git pull conflict with package-lock.json
# Run this on your DigitalOcean droplet

echo "🔧 Fixing git pull conflict..."

cd /var/www/html/Power-Plus-Gym-Management-System-V

# Option 1: Stash local changes (safest)
echo "📦 Stashing local changes..."
git stash

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

# If you need the stashed changes back, run: git stash pop
# But for package-lock.json, you usually don't need them

# Rebuild frontend with new dependencies
echo "🔨 Rebuilding frontend..."
npm install
npm run build:frontend

# Copy to nginx directory
echo "🚀 Deploying to Port 3000..."
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/

# Reload nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Done! Your app is updated."
echo ""
echo "📝 Note: If you had important local changes, run: git stash pop"

