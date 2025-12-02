#!/bin/bash

# Fix merge conflict on droplet
# Run this on the droplet when git pull fails due to local changes

cd /var/www/html/Power-Plus-Gym-Management-System-V

echo "📦 Stashing local changes..."
git stash

echo "⬇️ Pulling latest changes..."
git pull

echo "✅ Done! If you had important local changes, check with: git stash list"
echo "   To restore stashed changes: git stash pop"

