# Setting Up Automatic Updates for Capacitor App

## ❌ The Problem

You tried to install `react-native-code-push`, but that's for **React Native**, not **Capacitor**.

For Capacitor apps, we'll use a different approach: **Load the app from your server** instead of bundling it in the APK.

## ✅ Solution: Server-Based Loading

Instead of bundling the app in the APK, we'll configure Capacitor to load the app from your server. This way:
- ✅ Update server → All apps get update automatically
- ✅ No need to rebuild APK for code changes
- ✅ Works like a web app, but in a native container

## 🚀 Setup Steps

### Step 1: Remove Wrong Package (on server)

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm uninstall react-native-code-push
```

### Step 2: Serve Frontend from Your Server

You need to serve the `dist` folder from your server. You can use Nginx or serve it from your Node.js backend.

**Option A: Using Nginx (Recommended)**

Add to your Nginx config:

```nginx
server {
    listen 80;
    server_name 167.172.90.182;

    # Serve the React app
    location / {
        root /var/www/html/Power-Plus-Gym-Management-System-V/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Serve from Express (Simple)**

Add to your `gym-backend/server.ts`:

```typescript
import express from 'express';
import path from 'path';

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use('/api', /* your API routes */);

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

### Step 3: Build and Deploy Frontend

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm run build:frontend
```

### Step 4: Update Capacitor Config

Update `capacitor.config.ts` to load from server:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.powerplusgym.app',
  appName: 'Power Plus Gym',
  webDir: 'dist',
  server: {
    // Load app from your server instead of bundled files
    url: 'http://167.172.90.182',
    cleartext: true  // Allow HTTP (use HTTPS in production)
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
```

### Step 5: Rebuild APK (One Time)

After changing `capacitor.config.ts`, rebuild the APK:

```bash
# On your local Windows machine
npm run build:frontend
npm run sync:android
cd android
gradlew.bat assembleDebug
```

### Step 6: Install APK on Devices

Install the new APK. Now the app will load from your server!

## 🔄 How Updates Work Now

1. **Make code changes** on your server
2. **Build frontend**: `npm run build:frontend`
3. **Deploy dist folder** to your server
4. **Users open app** → App automatically loads latest version from server!

No need to rebuild APK for code changes! 🎉

## ⚠️ Important Notes

### Pros:
- ✅ Automatic updates (no APK rebuild needed)
- ✅ Works like a web app
- ✅ Easy to deploy changes

### Cons:
- ❌ Requires internet connection (app won't work offline)
- ❌ First load might be slower (loading from server)
- ❌ Uses HTTP (not secure, but works for now)

### For Production:
- Use HTTPS instead of HTTP
- Get SSL certificate
- Update `server.url` to `https://yourdomain.com`
- Remove `cleartext: true`

## 🎯 Alternative: Hybrid Approach

If you want offline capability but still want updates:

1. **Keep app bundled** (remove `server.url`)
2. **Check for updates** on app start
3. **Download new version** if available
4. **Reload app** with new files

This is more complex but gives you both offline support and updates.

## 📝 Summary

**What we did:**
1. Removed wrong package (`react-native-code-push`)
2. Configured Capacitor to load from server
3. Set up server to serve `dist` folder
4. App now loads from server → automatic updates!

**Next steps:**
- Build frontend and deploy to server
- Rebuild APK once with new config
- Install APK on devices
- Future updates: Just rebuild frontend and deploy!

