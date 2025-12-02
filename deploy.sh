#!/bin/bash

# 1. Go to project folder
echo "📂 Moving to project folder..."
cd /var/www/html/Power-Plus-Gym-Management-System-V

# 2. Get latest code
echo "⬇️ Pulling from GitHub..."
git pull origin main  # Change 'main' to 'master' if needed

# 3. Create .env file with correct API URL (CRITICAL!)
echo "📝 Creating .env file with correct API URL..."
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF
echo "✅ .env file created:"
cat .env

# 4. Install dependencies (in case you added new packages)
echo "📦 Installing dependencies..."
npm install

# 5. Build the project (this will use the .env file we just created)
echo "🔨 Building project with correct API URL..."
npm run build

# 6. Verify build doesn't contain localhost
echo "🔍 Verifying build..."
if grep -r "localhost:4000" dist/ 2>/dev/null | head -1; then
    echo "⚠️  WARNING: Build still contains 'localhost:4000'!"
    echo "   This might be in source maps or comments. Checking..."
else
    echo "✅ Build verified (no localhost:4000 found)"
fi

# 7. Move files to NGINX folder
echo "🚀 Deploying to Port 3000..."
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/

# 8. Reload Nginx to serve new files
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅✅✅ Deployment Complete! ✅✅✅"
echo ""
echo "📋 IMPORTANT: Clear browser cache or use Incognito mode!"
echo "   Frontend: http://167.172.90.182:3000"
echo "   API: http://167.172.90.182:4000/api"
echo ""
