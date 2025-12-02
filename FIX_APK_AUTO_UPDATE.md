# Fix APK Not Auto-Updating

## 🔴 Problem
The Android APK is not automatically updating the UI even though automatic updates are configured.

## ✅ Solution

### Step 1: Verify Server Configuration

The `capacitor.config.ts` should have:
```typescript
server: {
  url: 'http://167.172.90.182:4000',
  cleartext: true
}
```

✅ This is already configured correctly!

### Step 2: Rebuild APK ONCE with New Configuration

**IMPORTANT:** You need to rebuild the APK **ONE TIME** with the new server configuration. After that, it will load from the server automatically.

**On your Windows machine:**

```bash
cd C:\Users\User\Downloads\Power-Plus-Gym-Management-System-V

# 1. Pull latest changes
git pull origin main

# 2. Build frontend
npm run build:frontend

# 3. Sync with Capacitor (this updates the Android project with new config)
npm run sync:android

# 4. Build new APK
cd android
gradlew.bat assembleDebug

# 5. Install the new APK on your phone
# The APK will be at: android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 3: Verify Server is Serving Frontend

**On your server, check:**

```bash
# 1. Make sure frontend is built
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm run build:frontend

# 2. Check if dist folder exists
ls -la dist/

# 3. Test if server is serving the frontend
curl http://167.172.90.182:4000/

# Should return HTML content, not 404
```

### Step 4: Test in Browser First

Before testing on the phone, verify the server is working:

1. Open browser on your computer
2. Go to: `http://167.172.90.182:4000`
3. You should see your React app
4. If you see the app, the server is working correctly

### Step 5: Clear App Cache (If Still Not Working)

If the APK still shows old UI after rebuilding:

1. **On your phone:**
   - Go to Settings → Apps → Power Plus Gym
   - Tap "Storage"
   - Tap "Clear Cache"
   - Tap "Clear Data" (you'll need to login again)

2. **Or uninstall and reinstall:**
   - Uninstall the old app
   - Install the new APK

## 🔍 How to Verify It's Working

### Check 1: Network Tab
1. Open the app on your phone
2. Connect phone to computer via USB
3. Enable USB debugging
4. Open Chrome DevTools → Remote devices
5. Check Network tab - you should see requests to `http://167.172.90.182:4000`

### Check 2: Console Logs
1. In Chrome DevTools (remote debugging)
2. Check Console tab
3. Look for errors about loading from server

### Check 3: Test Update
1. Make a small UI change (e.g., change a button color)
2. Build frontend on server: `npm run build:frontend`
3. Restart backend: `pm2 restart gym-api`
4. Close and reopen the app on your phone
5. The change should appear immediately!

## ⚠️ Common Issues

### Issue 1: APK Still Using Bundled Files
**Cause:** APK was built before server configuration
**Fix:** Rebuild APK once with new configuration (Step 2)

### Issue 2: Server Not Serving Frontend
**Cause:** Backend not serving dist folder
**Fix:** Check server logs: `pm2 logs gym-api`
- Should see: `📱 Serving frontend from: /var/www/html/.../dist`

### Issue 3: Network Error
**Cause:** Phone can't reach server
**Fix:** 
- Check phone has internet
- Test: Open browser on phone → `http://167.172.90.182:4000`
- Check firewall allows port 4000

### Issue 4: Cached Old Version
**Cause:** Browser/WebView cache
**Fix:** Clear app cache (Step 5)

## 📝 Summary

**To get automatic updates working:**

1. ✅ Server config is already set up
2. 🔨 **Rebuild APK ONCE** with new config
3. 📱 Install new APK on phone
4. 🎉 Future updates: Just rebuild frontend on server!

**After rebuilding the APK once, you'll never need to rebuild it again for UI changes!**

