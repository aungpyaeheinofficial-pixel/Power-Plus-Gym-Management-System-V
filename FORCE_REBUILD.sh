#!/bin/bash

# Force complete rebuild of frontend with correct API URL
# This deletes old build and rebuilds from scratch

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "🗑️  Step 1: Deleting old build..."
rm -rf dist
rm -rf node_modules/.vite
echo "✅ Old build deleted"

echo ""
echo "📝 Step 2: Creating/updating .env file..."
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF
echo "✅ .env file created:"
cat .env

echo ""
echo "📦 Step 3: Installing dependencies..."
npm install

echo ""
echo "🔨 Step 4: Building frontend from scratch (this may take a minute)..."
npm run build

echo ""
echo "🔍 Step 5: Verifying build..."
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist folder not created."
    exit 1
fi

echo "✅ dist folder created"

# Check if build contains localhost (should NOT)
if grep -r "localhost:4000" dist/ 2>/dev/null | head -1; then
    echo "❌ ERROR: Build still contains 'localhost:4000'!"
    echo "   This should not happen. Check .env file."
    exit 1
else
    echo "✅ Build does NOT contain 'localhost:4000'"
fi

# Check if build contains correct IP (should)
if grep -r "167.172.90.182:4000" dist/ 2>/dev/null | head -1; then
    echo "✅ Build contains correct API URL: 167.172.90.182:4000"
else
    echo "⚠️  Warning: Could not find API URL in build (might be minified)"
fi

echo ""
echo "🔄 Step 6: Stopping old frontend server..."
pm2 delete gym-frontend 2>/dev/null || true

echo ""
echo "🚀 Step 7: Starting frontend server with new build..."
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    npm install -g serve
fi

pm2 start serve --name gym-frontend -- -s dist -l 3000
pm2 save

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "✅✅✅ REBUILD COMPLETE! ✅✅✅"
echo ""
echo "📋 CRITICAL: Do this in your browser NOW:"
echo "   1. Close ALL tabs with http://167.172.90.182:3000"
echo "   2. Clear browser cache: Ctrl+Shift+Delete → Clear cached files"
echo "   3. Open NEW tab (or use Incognito/Private mode)"
echo "   4. Go to: http://167.172.90.182:3000"
echo "   5. Open DevTools (F12) → Network tab → Check 'Disable cache'"
echo "   6. Try adding a member"
echo "   7. Should see: http://167.172.90.182:4000/api/members"
echo ""
echo "📋 If still seeing localhost:"
echo "   - The browser is caching. Use Incognito mode."
echo "   - Or wait 5 minutes for cache to expire"
echo ""

