#!/bin/bash

# DigitalOcean Deployment Script
# Run this from your local machine to deploy to droplet

DROPLET_IP="YOUR_DROPLET_IP"
DROPLET_USER="root"
BACKEND_DIR="gym-backend"
FRONTEND_DIR="."

echo "🚀 Starting deployment to DigitalOcean..."

# Step 1: Build backend
echo "📦 Building backend..."
cd $BACKEND_DIR
npm install
npm run build
cd ..

# Step 2: Upload backend
echo "📤 Uploading backend to droplet..."
scp -r $BACKEND_DIR/dist $DROPLET_USER@$DROPLET_IP:/var/www/gym-backend/
scp $BACKEND_DIR/package.json $DROPLET_USER@$DROPLET_IP:/var/www/gym-backend/
scp $BACKEND_DIR/.env $DROPLET_USER@$DROPLET_IP:/var/www/gym-backend/ 2>/dev/null || echo "⚠️  .env file not found, create it manually on server"

# Step 3: Build frontend
echo "📦 Building frontend..."
npm install
npm run build

# Step 4: Upload frontend
echo "📤 Uploading frontend to droplet..."
scp -r dist $DROPLET_USER@$DROPLET_IP:/var/www/gym-frontend/

# Step 5: Restart services on droplet
echo "🔄 Restarting services on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << 'ENDSSH'
cd /var/www/gym-backend
npm install --production
pm2 restart gym-api || pm2 start dist/server.js --name gym-api
pm2 save
sudo systemctl restart nginx
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Visit: http://$DROPLET_IP"
echo "🔍 Check API: http://$DROPLET_IP/api/health"

