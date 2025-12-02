#!/bin/bash

# Verify and fix frontend API URL issue
# Run this on your droplet

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "🔍 Step 1: Checking current .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists:"
    cat .env
    echo ""
    
    # Check if it has the correct URL
    if grep -q "167.172.90.182:4000" .env; then
        echo "✅ .env has correct API URL"
    else
        echo "❌ .env does NOT have correct API URL!"
        echo "📝 Creating correct .env file..."
        cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF
        echo "✅ .env file updated"
    fi
else
    echo "❌ .env file does NOT exist!"
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF
    echo "✅ .env file created"
fi

echo ""
echo "🔍 Step 2: Checking if dist folder exists..."
if [ -d "dist" ]; then
    echo "✅ dist folder exists"
    echo "📅 Checking build timestamp..."
    ls -lh dist/ | head -5
    
    echo ""
    echo "🔍 Step 3: Checking if build contains localhost (old build)..."
    if grep -r "localhost:4000" dist/ 2>/dev/null | head -3; then
        echo "❌ OLD BUILD DETECTED! Build still contains 'localhost:4000'"
        echo "🔨 Rebuilding frontend NOW..."
    else
        echo "✅ Build does NOT contain localhost:4000"
        echo "🔍 Checking if build contains correct IP..."
        if grep -r "167.172.90.182:4000" dist/ 2>/dev/null | head -3; then
            echo "✅ Build contains correct API URL!"
            echo ""
            echo "⚠️  But browser is still using old files. Try:"
            echo "   1. Hard refresh: Ctrl+Shift+R"
            echo "   2. Clear browser cache"
            echo "   3. Check if frontend server is serving from 'dist' folder"
        else
            echo "⚠️  Could not find API URL in build. Rebuilding..."
        fi
    fi
else
    echo "❌ dist folder does NOT exist! Need to build."
fi

echo ""
echo "🔨 Step 4: Rebuilding frontend (this will fix it)..."
npm run build

echo ""
echo "🔍 Step 5: Verifying new build..."
if grep -r "167.172.90.182:4000" dist/ 2>/dev/null | head -1; then
    echo "✅✅✅ SUCCESS! New build contains correct API URL!"
else
    echo "⚠️  Warning: Could not verify API URL in build"
fi

echo ""
echo "🔄 Step 6: Restarting frontend server..."
if pm2 list | grep -q "gym-frontend"; then
    pm2 restart gym-frontend
    echo "✅ Restarted gym-frontend"
else
    if ! command -v serve &> /dev/null; then
        npm install -g serve
    fi
    pm2 start serve --name gym-frontend -- -s dist -l 3000
    echo "✅ Started gym-frontend"
fi
pm2 save

echo ""
echo "✅✅✅ COMPLETE! ✅✅✅"
echo ""
echo "📋 NOW DO THIS IN YOUR BROWSER:"
echo "   1. Close ALL tabs with http://167.172.90.182:3000"
echo "   2. Open a NEW tab"
echo "   3. Go to http://167.172.90.182:3000"
echo "   4. Press Ctrl+Shift+R (hard refresh)"
echo "   5. Open DevTools (F12) → Network tab"
echo "   6. Try adding a member"
echo "   7. You should see: http://167.172.90.182:4000/api/members"
echo ""

