#!/bin/bash

# Setup frontend environment and rebuild
# Run this on the droplet after setting up backend

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "📝 Creating frontend .env file..."
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF

echo "🔨 Rebuilding frontend with correct API URL..."
npm run build

echo "✅ Frontend rebuilt!"
echo "🌐 Frontend should now connect to API at http://167.172.90.182:4000/api"

