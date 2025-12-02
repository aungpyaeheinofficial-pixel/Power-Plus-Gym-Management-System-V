@echo off
REM Build APK for Windows
echo Building APK...

cd android

REM Check if gradlew.bat exists
if not exist "gradlew.bat" (
    echo Error: gradlew.bat not found!
    echo Make sure you're in the project root directory.
    pause
    exit /b 1
)

REM Build debug APK
echo Running Gradle build...
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo APK built successfully!
    echo ========================================
    echo.
    echo APK location:
    echo android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo You can now:
    echo 1. Copy this APK to your tablet
    echo 2. Upload to Google Drive
    echo 3. Share via email
    echo.
) else (
    echo.
    echo Build failed! Check errors above.
    echo.
)

pause

