#!/bin/bash

echo "📊 Checking users table in MySQL..."
echo ""

# Read database credentials from .env if it exists
if [ -f "gym-backend/.env" ]; then
    source gym-backend/.env
    DB_USER=${DB_USER:-gym_user}
    DB_NAME=${DB_NAME:-power_plus_gym}
else
    DB_USER="gym_user"
    DB_NAME="power_plus_gym"
fi

echo "🔍 Viewing all users:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT id, username, full_name, role, created_at FROM users ORDER BY id DESC;" 2>/dev/null || {
    echo "❌ Error: Could not connect to database"
    echo "💡 Try running: mysql -u gym_user -p power_plus_gym"
    exit 1
}

echo ""
echo "📈 Total users:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) as total_users FROM users;" 2>/dev/null

echo ""
echo "📋 Table structure:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE users;" 2>/dev/null

