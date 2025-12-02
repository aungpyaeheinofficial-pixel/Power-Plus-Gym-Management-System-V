#!/bin/bash

echo "🔧 Fixing Database Image Columns and Restarting Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Navigate to project directory
cd /var/www/html/Power-Plus-Gym-Management-System-V || exit 1

# Step 2: Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Step 3: Read database credentials from .env
if [ -f "gym-backend/.env" ]; then
    source gym-backend/.env
    DB_USER=${DB_USER:-gym_user}
    DB_NAME=${DB_NAME:-power_plus_gym}
    DB_PASSWORD=${DB_PASSWORD}
else
    echo -e "${RED}❌ Error: gym-backend/.env file not found${NC}"
    exit 1
fi

# Step 4: Run database migration
echo ""
echo "🗄️  Running database migration to fix image columns..."
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  DB_PASSWORD not set in .env, prompting for password...${NC}"
    mysql -u "$DB_USER" -p "$DB_NAME" < gym-backend/fix-image-columns.sql
else
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < gym-backend/fix-image-columns.sql 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Direct password failed, prompting interactively...${NC}"
        mysql -u "$DB_USER" -p "$DB_NAME" < gym-backend/fix-image-columns.sql
    }
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migration completed successfully${NC}"
else
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi

# Step 5: Verify the changes
echo ""
echo "🔍 Verifying database changes..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE products;" 2>/dev/null | grep image || {
    echo -e "${YELLOW}⚠️  Could not verify automatically. Please check manually.${NC}"
}

# Step 6: Rebuild backend
echo ""
echo "🔨 Rebuilding backend..."
cd gym-backend
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Step 7: Restart backend
echo ""
echo "🔄 Restarting backend API..."
pm2 restart gym-api || pm2 start dist/server.js --name gym-api

# Step 8: Check backend status
echo ""
echo "📊 Backend Status:"
pm2 status gym-api

# Step 9: Show recent logs
echo ""
echo "📋 Recent Backend Logs:"
pm2 logs gym-api --lines 10 --nostream

echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "🌐 Test the API:"
echo "   curl http://localhost:4000/api/health"
echo ""
echo "📝 Next steps:"
echo "   1. Clear your browser cache (Ctrl+Shift+Delete)"
echo "   2. Hard refresh the page (Ctrl+F5)"
echo "   3. Try uploading an image again"

