# 📱 Building APK on Windows

Quick guide for building APK files on Windows.

## 🚀 Quick Build (Easiest)

### Option 1: Use the Batch Script

```cmd
build-apk.bat
```

This will automatically:
- Navigate to android folder
- Run Gradle build
- Show you where the APK is located

### Option 2: Manual Command

```cmd
cd android
gradlew.bat assembleDebug
```

**Note**: On Windows, use `gradlew.bat` (not `./gradlew`)

---

## 📍 APK Location

After building, your APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🔧 Troubleshooting

### Error: "gradlew.bat not found"

**Solution**: Make sure you're in the project root directory:
```cmd
cd C:\Users\User\Downloads\Power-Plus-Gym-Management-System-V
cd android
gradlew.bat assembleDebug
```

### Error: "Java not found" or "JAVA_HOME not set"

**Solution**: Install Java JDK 17 or higher:
1. Download: https://adoptium.net/
2. Install JDK
3. Set JAVA_HOME environment variable:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Add new: `JAVA_HOME` = `C:\Program Files\Java\jdk-17` (or your JDK path)

### Error: "Android SDK not found"

**Solution**: 
- Install Android Studio: https://developer.android.com/studio
- Or set ANDROID_HOME environment variable

### Build Takes Too Long

**First build is slow** (downloads dependencies). Subsequent builds are faster.

---

## 🎯 Alternative: Build in Android Studio

1. Open Android Studio
2. Open the `android` folder
3. Wait for Gradle sync
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. APK will be in the same location

---

## 📤 After Building

Once you have the APK, see `CAPACITOR_APK_DISTRIBUTION.md` for how to share it with clients.

---

## 💡 Pro Tips

1. **First time?** Use Android Studio (easier setup)
2. **Command line?** Use `build-apk.bat` script
3. **Release APK?** Use `gradlew.bat assembleRelease` (requires signing)

---

**Need help?** Check the main `CAPACITOR_SETUP.md` guide!

