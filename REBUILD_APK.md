# How to Rebuild APK After Code Changes

When you make changes to your React code, you need to rebuild the APK for those changes to appear in your Android app.

## Steps to Rebuild APK:

### 1. Build the Frontend
```bash
npm run build:frontend
```

This creates the `dist` folder with your updated React app.

### 2. Sync with Capacitor
```bash
npm run sync:android
```

This copies the `dist` folder to the Android project.

### 3. Build the APK

**On Windows:**
```bash
cd android
gradlew.bat assembleDebug
```

Or use the batch file:
```bash
build-apk.bat
```

**On Mac/Linux:**
```bash
cd android
./gradlew assembleDebug
```

### 4. Find Your APK
The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Install on Your Phone
- Transfer the APK to your phone (USB, email, cloud storage, etc.)
- Enable "Install from Unknown Sources" in Android settings
- Open the APK file and install

## Quick Rebuild Script

You can create a script to do all steps at once:

**Windows (`rebuild-apk.bat`):**
```batch
@echo off
echo Building frontend...
call npm run build:frontend
echo Syncing with Android...
call npm run sync:android
echo Building APK...
cd android
call gradlew.bat assembleDebug
echo.
echo APK build complete!
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
pause
```

## Important Notes:

1. **Always rebuild after code changes** - The APK contains a snapshot of your code at build time
2. **Clear app data** (optional) - If you see old UI, try clearing app data in Android settings
3. **Uninstall and reinstall** - Sometimes needed if there are major changes
4. **Check Capacitor version** - Make sure `capacitor.config.ts` points to the correct `webDir` (should be `dist`)

## Troubleshooting:

- **UI not updating?** → Rebuild the frontend and sync again
- **Build errors?** → Check that all dependencies are installed (`npm install`)
- **APK won't install?** → Enable "Install from Unknown Sources" in Android settings
- **Still seeing old UI?** → Uninstall the old app completely, then install the new APK

