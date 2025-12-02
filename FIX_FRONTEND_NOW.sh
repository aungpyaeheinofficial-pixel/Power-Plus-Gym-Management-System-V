#!/bin/bash

# Complete fix for frontend API connection
# Run this on your droplet

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "🔧 Fixing frontend API connection..."

# Step 1: Create .env file with correct API URL
echo "📝 Creating .env file..."
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF

echo "✅ .env file created:"
cat .env

# Step 2: Install dependencies if needed
echo ""
echo "📦 Checking dependencies..."
npm install

# Step 3: Rebuild frontend (CRITICAL - Vite embeds env vars at build time)
echo ""
echo "🔨 Rebuilding frontend with correct API URL..."
npm run build

# Step 4: Check if build was successful
if [ -d "dist" ]; then
    echo ""
    echo "✅ Frontend built successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Make sure your frontend is serving from the 'dist' folder"
    echo "2. If using serve/PM2, restart it:"
    echo "   pm2 restart gym-frontend || pm2 start serve --name gym-frontend -- -s dist -l 3000"
    echo ""
    echo "3. Test in browser - should see requests to http://167.172.90.182:4000/api"
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi

