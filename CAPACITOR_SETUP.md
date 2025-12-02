# 📱 Capacitor Android Setup Guide

Your React web app has been successfully configured for Android using Capacitor!

## ✅ What's Been Done

1. ✅ Installed Capacitor dependencies
2. ✅ Initialized Capacitor configuration
3. ✅ Added Android platform
4. ✅ Updated Vite config for mobile builds
5. ✅ Updated API configuration for mobile (uses production API on mobile)
6. ✅ Created mobile utilities (status bar, keyboard, back button handling)
7. ✅ Configured Android permissions (Internet, Camera, Storage)
8. ✅ Set up network security config for HTTP API access

## 🚀 Quick Start

### Build and Open in Android Studio

```bash
# Build frontend and sync to Android
npm run build:android

# Or separately:
npm run build:frontend
npm run sync:android

# Open in Android Studio
npm run open:android
```

## 📋 Available Commands

- `npm run build:android` - Build frontend and sync to Android
- `npm run sync:android` - Sync web assets to Android (after building)
- `npm run open:android` - Open project in Android Studio

## 🔧 Android Studio Setup

### Prerequisites

1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Java JDK 17+**: Required for Android development
3. **Set up Android SDK**: Android Studio will guide you

### First Time Setup

1. Open Android Studio
2. Open the `android` folder in your project
3. Wait for Gradle sync to complete
4. Connect an Android device or start an emulator

### Build APK

**Debug APK (for testing):**
1. In Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (for distribution):**
1. `Build` → `Generate Signed Bundle / APK`
2. Create a keystore (first time only)
3. Follow the wizard
4. APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Command Line Build

```bash
cd android
./gradlew assembleDebug      # Debug APK
./gradlew assembleRelease    # Release APK (requires signing)
```

## 📱 Testing on Device

### Option 1: USB Debugging

1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. In Android Studio, click "Run" (green play button)
5. Select your device and click OK

### Option 2: Install APK Directly

1. Build APK (see above)
2. Transfer APK to your device
3. Enable "Install from Unknown Sources" in device settings
4. Tap the APK file to install

## 🔐 App Configuration

### App ID
- Package: `com.powerplusgym.app`
- App Name: `Power Plus Gym`

### API Configuration
- **Mobile**: Uses `http://167.172.90.182:4000/api` automatically
- **Web**: Uses `VITE_API_URL` environment variable

### Permissions
The app requests these permissions:
- Internet (required for API calls)
- Camera (for member/staff photos)
- Storage (for saving images)

### Network Security
HTTP is allowed for your API server (`167.172.90.182`). For production, consider:
- Using HTTPS
- Setting up SSL certificate
- Updating network security config

## 🎨 Customization

### App Icon
Replace icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Sizes: mdpi (48x48), hdpi (72x72), xhdpi (96x96), xxhdpi (144x144), xxxhdpi (192x192)

### App Name
Edit: `android/app/src/main/res/values/strings.xml`

### Version
Edit: `android/app/build.gradle`
```gradle
versionCode 1        // Increment for each release
versionName "1.0.0"  // User-visible version
```

## 🐛 Troubleshooting

### Build Fails
- **Error**: "SDK location not found"
  - Solution: Set `ANDROID_HOME` environment variable
  - Or: In Android Studio, File → Project Structure → SDK Location

### API Not Connecting
- **Error**: Network error or timeout
  - Check: Device can reach `167.172.90.182:4000`
  - Check: Network security config is correct
  - Check: Firewall allows connections

### White Screen
- Check: Android Studio Logcat for errors
- Check: `npx cap sync android` was run after build
- Check: API URL is correct

### Gradle Sync Fails
- **Error**: "Could not resolve dependencies"
  - Solution: In Android Studio, File → Invalidate Caches / Restart
  - Or: Delete `android/.gradle` and sync again

## 📦 Publishing to Google Play Store

1. **Create Keystore**:
   ```bash
   keytool -genkey -v -keystore power-plus-gym.keystore -alias power-plus-gym -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing**:
   - Edit `android/app/build.gradle`
   - Add signing config

3. **Build Release Bundle**:
   - Android Studio: `Build` → `Generate Signed Bundle / APK` → `Android App Bundle`

4. **Upload to Play Console**:
   - Go to https://play.google.com/console
   - Create new app
   - Upload AAB file
   - Complete store listing

## 🔄 Development Workflow

1. **Make changes** to your React code
2. **Build**: `npm run build:frontend`
3. **Sync**: `npm run sync:android`
4. **Test**: Run in Android Studio or install APK

## 📝 Notes

- The app uses HTTP (not HTTPS) for API calls. This is configured in `network_security_config.xml`
- For production, consider migrating to HTTPS
- App size: ~10-20MB (includes WebView)
- Minimum Android version: API 22 (Android 5.1)
- Target Android version: Latest

## 🆘 Need Help?

- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio Docs: https://developer.android.com/studio
- Capacitor Community: https://github.com/ionic-team/capacitor

---

**Happy Building! 🚀**

