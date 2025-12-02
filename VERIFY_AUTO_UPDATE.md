# Verify Auto-Update is Working

## Quick Test

### 1. Make a Visible Change

Edit any component to make a visible change, for example in `components/Layout.tsx`:

```typescript
// Change the logo text temporarily
<h1 className="text-2xl font-black italic tracking-tighter text-white uppercase transform -skew-x-6">
  POWER PLUS TEST
</h1>
```

### 2. Deploy to Server

```bash
# On server
cd /var/www/html/Power-Plus-Gym-Management-System-V
npm run build:frontend
pm2 restart gym-api
```

### 3. Test in Browser

Open: `http://167.172.90.182:4000`
- Should see "POWER PLUS TEST" in the logo

### 4. Test on Phone

1. **If APK was built AFTER server config:**
   - Close and reopen app
   - Should see "POWER PLUS TEST" immediately ✅

2. **If APK was built BEFORE server config:**
   - Still shows old version ❌
   - Need to rebuild APK (see FIX_APK_AUTO_UPDATE.md)

## How to Check if APK is Using Server

### Method 1: Check Capacitor Config in APK

The APK contains the Capacitor config. If it has `server.url`, it will load from server.

### Method 2: Network Monitoring

1. Enable USB debugging on phone
2. Connect to Chrome DevTools
3. Open app
4. Check Network tab
5. Should see requests to `http://167.172.90.182:4000` if using server
6. If only seeing local files, it's using bundled files

### Method 3: Check Build Date

1. Check when you last rebuilt the APK
2. If before server config was added, need to rebuild

## Expected Behavior

### ✅ Working Correctly:
- App loads from `http://167.172.90.182:4000`
- Network requests visible in DevTools
- UI updates immediately after server rebuild
- No need to rebuild APK for UI changes

### ❌ Not Working:
- App shows bundled files
- No network requests to server
- UI doesn't update after server rebuild
- Need to rebuild APK for every change

