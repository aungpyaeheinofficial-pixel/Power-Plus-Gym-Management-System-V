# How to Update VPS with Latest Changes

## Quick Update Steps

### Step 1: SSH into Your VPS

```bash
ssh root@167.172.90.182
```

(Or use your SSH client/Putty on Windows)

### Step 2: Navigate to Project Directory

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
```

### Step 3: Pull Latest Changes from Git

```bash
git pull origin main
```

This will download all the latest changes including the "A7 smart Gym System" branding updates.

### Step 4: Rebuild Frontend

```bash
npm run build:frontend
```

This builds the frontend with the new changes.

### Step 5: Restart Backend Service

```bash
cd gym-backend
npm run build
pm2 restart gym-api
```

This rebuilds and restarts the backend with the new changes.

### Step 6: Verify Everything is Working

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs gym-api --lines 20

# Test the API
curl http://localhost:4000/api/health
```

Expected response:
```json
{"status":"ok","message":"A7 smart Gym System API is running"}
```

## Complete Update Script

You can also create a script to do all this at once:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
git pull origin main
npm run build:frontend
cd gym-backend
npm run build
pm2 restart gym-api
pm2 logs gym-api --lines 10
```

## Troubleshooting

### If git pull fails with conflicts:

```bash
# Backup current changes
git stash

# Pull again
git pull origin main

# If needed, restore your changes
git stash pop
```

### If build fails:

```bash
# Clear node_modules and reinstall (frontend)
cd /var/www/html/Power-Plus-Gym-Management-System-V
rm -rf node_modules
npm install
npm run build:frontend

# Backend
cd gym-backend
rm -rf node_modules
npm install
npm run build
pm2 restart gym-api
```

### If PM2 service is not running:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend
pm2 start dist/server.js --name gym-api
pm2 save
```

### If port is already in use:

```bash
# Check what's using port 4000
lsof -i :4000

# Or
netstat -tulpn | grep 4000

# Kill the process if needed (replace PID with actual process ID)
kill -9 PID
```

## Verify Updates

### Check Frontend:
1. Open browser: `http://167.172.90.182:4000`
2. You should see "A7 SMART" in the logo
3. Check browser console for any errors

### Check API:
```bash
curl http://167.172.90.182:4000/api/health
```

Should return:
```json
{"status":"ok","message":"A7 smart Gym System API is running"}
```

### Check Android App:
- If you've set up auto-update (server.url in capacitor.config.ts)
- The app should automatically load the new UI from the server
- Close and reopen the app to see changes

## Summary

**Quick update command sequence:**
```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V && \
git pull origin main && \
npm run build:frontend && \
cd gym-backend && \
npm run build && \
pm2 restart gym-api
```

That's it! Your VPS is now updated with the latest changes. 🚀

