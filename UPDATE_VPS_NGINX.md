# Update VPS with Nginx (Port 3000)

## Your Current Setup

- **Frontend:** Served by Nginx on port 3000 from `/var/www/app3000/`
- **Backend:** Running on port 4000 via PM2
- **Nginx:** Serving static files from `/var/www/app3000/`

## Update Steps

### Step 1: SSH into VPS

```bash
ssh root@167.172.90.182
```

### Step 2: Navigate and Pull Latest Changes

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
git pull origin main
```

### Step 3: Rebuild Frontend

```bash
npm run build:frontend
```

This creates the `dist` folder with the new changes.

### Step 4: Deploy to Nginx Directory

```bash
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/
```

### Step 5: Restart Backend (if needed)

```bash
cd gym-backend
npm run build
pm2 restart gym-api
```

### Step 6: Reload Nginx

```bash
sudo systemctl reload nginx
```

### Step 7: Clear Browser Cache

**Important:** Your browser may be caching the old files!

- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) for hard refresh
- Or open in Incognito/Private mode
- Or clear browser cache manually

## Complete One-Command Update

Run this on your VPS:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V && \
git pull origin main && \
npm run build:frontend && \
rm -rf /var/www/app3000/* && \
cp -r dist/* /var/www/app3000/ && \
cd gym-backend && \
npm run build && \
pm2 restart gym-api && \
sudo systemctl reload nginx && \
echo "✅ Update complete! Clear browser cache and refresh."
```

## Verify Update

1. **Check files:**
   ```bash
   ls -la /var/www/app3000/ | head -20
   ```

2. **Check API:**
   ```bash
   curl http://localhost:4000/api/health
   ```
   Should show: `{"status":"ok","message":"A7 smart Gym System API is running"}`

3. **Test in browser:**
   - Go to: `http://167.172.90.182:3000`
   - Open in **Incognito mode** or **hard refresh** (`Ctrl+Shift+R`)
   - You should see "A7 SMART" in the sidebar logo

## Troubleshooting

### If changes still don't show:

1. **Clear nginx cache:**
   ```bash
   sudo rm -rf /var/cache/nginx/*
   sudo systemctl reload nginx
   ```

2. **Check nginx config:**
   ```bash
   sudo nginx -t
   ```

3. **Verify files are copied:**
   ```bash
   # Check if new files exist
   cat /var/www/app3000/index.html | grep "A7 smart"
   ```

4. **Check file permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/app3000
   sudo chmod -R 755 /var/www/app3000
   ```

### If build fails:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
rm -rf node_modules
npm install
npm run build:frontend
```

## Summary

**The key steps are:**
1. ✅ Pull code: `git pull origin main`
2. ✅ Build frontend: `npm run build:frontend`
3. ✅ Copy to nginx: `cp -r dist/* /var/www/app3000/`
4. ✅ Reload nginx: `sudo systemctl reload nginx`
5. ✅ **Clear browser cache!**

That's it! 🚀

