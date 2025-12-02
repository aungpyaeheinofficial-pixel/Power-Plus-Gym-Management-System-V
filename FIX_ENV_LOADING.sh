#!/bin/bash

# Fix Vite environment variable loading
# Vite needs .env.production for production builds

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "🔧 Fixing Vite environment variable loading..."

# Delete old builds
rm -rf dist
rm -rf node_modules/.vite

# Create .env.production (Vite uses this for production builds)
echo "📝 Creating .env.production file..."
cat > .env.production << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF

# Also create regular .env (for development)
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF

echo "✅ Created both .env and .env.production:"
echo ""
echo ".env:"
cat .env
echo ""
echo ".env.production:"
cat .env.production

# Verify files exist
if [ ! -f ".env" ] || [ ! -f ".env.production" ]; then
    echo "❌ Error: .env files not created!"
    exit 1
fi

echo ""
echo "🔨 Building frontend..."
npm run build

echo ""
echo "🔍 Verifying build..."
if grep -r "localhost:4000" dist/ 2>/dev/null | head -1; then
    echo "❌ Still contains localhost:4000"
    echo ""
    echo "🔍 Checking what's in the build..."
    grep -r "localhost:4000" dist/ | head -3
    echo ""
    echo "🔍 Checking if correct URL is in build..."
    if grep -r "167.172.90.182:4000" dist/ 2>/dev/null | head -1; then
        echo "✅ Build also contains correct URL (might be in source maps)"
    fi
else
    echo "✅ Build does NOT contain localhost:4000"
fi

# Check if correct URL is in build
if grep -r "167.172.90.182:4000" dist/ 2>/dev/null | head -1; then
    echo "✅ Build contains correct API URL!"
else
    echo "⚠️  Warning: Could not find correct URL in build"
fi

echo ""
echo "🚀 Deploying to Nginx..."
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/
sudo systemctl reload nginx

echo ""
echo "✅ Done! Clear browser cache or use Incognito mode."

