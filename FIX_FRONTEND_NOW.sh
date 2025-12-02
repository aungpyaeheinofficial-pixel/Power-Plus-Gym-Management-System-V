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
    
    # Step 5: Restart frontend server
    echo ""
    echo "🔄 Restarting frontend server..."
    
    # Try to restart existing PM2 process
    if pm2 list | grep -q "gym-frontend"; then
        pm2 restart gym-frontend
        echo "✅ Restarted existing gym-frontend process"
    else
        # Install serve if not available
        if ! command -v serve &> /dev/null; then
            echo "📦 Installing serve..."
            npm install -g serve
        fi
        # Start new PM2 process
        pm2 start serve --name gym-frontend -- -s dist -l 3000
        echo "✅ Started new gym-frontend process"
    fi
    
    pm2 save
    
    echo ""
    echo "✅✅✅ ALL DONE! ✅✅✅"
    echo ""
    echo "📋 IMPORTANT:"
    echo "1. Hard refresh your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
    echo "2. Open DevTools (F12) → Network tab"
    echo "3. Try adding a member"
    echo "4. You should see: http://167.172.90.182:4000/api/members (NOT localhost!)"
    echo ""
    echo "📊 Check PM2 status: pm2 status"
    echo "📋 View logs: pm2 logs gym-frontend"
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi

