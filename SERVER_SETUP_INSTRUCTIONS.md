# Server Setup Instructions for Automatic Updates

## ✅ What's Been Done

1. ✅ Updated `capacitor.config.ts` to load app from server (`http://167.172.90.182:4000`)
2. ✅ Added static file serving to Express server
3. ✅ Added SPA fallback route for React Router
4. ✅ Created deployment script

## 🚀 Next Steps (Run on Your Server)

### Step 1: Remove Wrong Package

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm uninstall react-native-code-push
```

### Step 2: Pull Latest Changes

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
git pull origin main
```

### Step 3: Install Dependencies (if needed)

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm install
cd gym-backend
npm install
```

### Step 4: Build Frontend

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm run build:frontend
```

This creates the `dist` folder that the server will serve.

### Step 5: Rebuild Backend

```bash
cd gym-backend
npm run build
```

### Step 6: Restart Backend Server

```bash
pm2 restart gym-api
# Or if not running:
pm2 start dist/server.js --name gym-api
```

### Step 7: Verify It Works

1. Open browser: `http://167.172.90.182:4000`
2. You should see your React app!
3. API should work: `http://167.172.90.182:4000/api/health`

## 📱 Rebuild APK (One Time on Your Local Machine)

After the server is set up, rebuild the APK **once** with the new configuration:

**On Windows:**
```bash
cd C:\Users\User\Downloads\Power-Plus-Gym-Management-System-V
git pull origin main
npm run build:frontend
npm run sync:android
cd android
gradlew.bat assembleDebug
```

Install this new APK on your devices. After this, **you won't need to rebuild APK anymore!**

## 🔄 How Updates Work Now

1. **Make code changes** on server or locally
2. **Build frontend**: `npm run build:frontend`
3. **Deploy to server** (if changed locally, push to git first)
4. **Restart backend**: `pm2 restart gym-api`
5. **Users open app** → Automatically gets latest version! 🎉

## 📝 Quick Deploy Script

You can use the provided script:

```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

Or manually:
```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm run build:frontend
cd gym-backend
pm2 restart gym-api
```

## ⚠️ Important Notes

- **Internet Required**: App needs internet to load from server
- **First Load**: Might be slower (loading from server)
- **HTTP Only**: Currently using HTTP (not secure, but works)
- **For Production**: Consider HTTPS and SSL certificate

## 🐛 Troubleshooting

### App shows blank screen
- Check if `dist` folder exists and has files
- Check server logs: `pm2 logs gym-api`
- Verify server is running: `pm2 list`

### API not working
- Check if backend is running: `pm2 list`
- Check API endpoint: `curl http://167.172.90.182:4000/api/health`

### App not updating
- Clear app cache/data on device
- Force close and reopen app
- Check if server is serving latest `dist` folder

## ✅ Summary

**Before:** 
- Change code → Rebuild APK → Install on each device ❌

**Now:**
- Change code → Build frontend → Deploy → All devices auto-update! ✅

No more rebuilding APK for every code change! 🎉

