@echo off
echo ========================================
echo   Rebuilding APK with Latest Changes
echo ========================================
echo.

echo [1/4] Building frontend...
call npm run build:frontend
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo [2/4] Syncing with Android...
call npm run sync:android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo ✓ Synced with Android
echo.

echo [3/4] Building APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: APK build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ APK built successfully
echo.

echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo APK Location:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next steps:
echo   1. Transfer APK to your phone
echo   2. Uninstall old app (if needed)
echo   3. Install new APK
echo   4. Enable "Install from Unknown Sources" if prompted
echo.
pause

