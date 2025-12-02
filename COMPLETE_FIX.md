# 🔧 Complete Fix: Frontend Not Connecting to API

## The Problem
Your frontend is trying to call `http://localhost:4000/api/members` but it should call `http://167.172.90.182:4000/api/members`.

**Why?** Vite embeds environment variables at BUILD TIME, not runtime. The old build still has `localhost:4000` hardcoded.

## The Solution (Run on Droplet)

### Step 1: Fix Git Merge Conflict (if needed)
```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
git stash
git pull
```

### Step 2: Create .env File
```bash
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF

# Verify it was created correctly
cat .env
```

### Step 3: Rebuild Frontend (CRITICAL!)
```bash
# This is the most important step - Vite needs to rebuild to pick up .env
npm run build
```

### Step 4: Verify Build
```bash
# Check if dist folder exists and has new files
ls -la dist/

# Check the built JavaScript to see if it has the correct API URL
grep -r "167.172.90.182" dist/ || echo "❌ API URL not found in build!"
```

### Step 5: Restart Frontend Server
```bash
# If using PM2 with serve:
pm2 restart gym-frontend || pm2 start serve --name gym-frontend -- -s dist -l 3000
pm2 save

# Or if using nginx:
sudo systemctl reload nginx
```

### Step 6: Clear Browser Cache
1. Open your browser
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh
3. Or open DevTools → Network tab → Check "Disable cache"

## Verify It Works

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try adding a member
4. You should see: `http://167.172.90.182:4000/api/members` ✅
5. NOT: `http://localhost:4000/api/members` ❌

## Quick One-Liner Fix

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V && \
git stash && git pull && \
echo 'VITE_API_URL=http://167.172.90.182:4000/api' > .env && \
npm run build && \
pm2 restart gym-frontend || pm2 start serve --name gym-frontend -- -s dist -l 3000 && \
pm2 save && \
echo "✅ Done! Now hard refresh your browser (Ctrl+Shift+R)"
```

## Troubleshooting

**Still seeing localhost?**
- Make sure you ran `npm run build` AFTER creating `.env`
- Check `.env` file exists: `cat .env`
- Verify build has new timestamp: `ls -l dist/`
- Hard refresh browser (Ctrl+Shift+R)

**Build fails?**
```bash
npm install
npm run build
```

**PM2 not found?**
```bash
sudo npm install -g pm2
```

