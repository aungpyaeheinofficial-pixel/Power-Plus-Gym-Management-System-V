#!/bin/bash

# Script to help share APK file via QR code or direct link
# Usage: ./share-apk.sh

echo "📱 APK Sharing Helper"
echo ""

# Find APK file
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at: $APK_PATH"
    echo "💡 Building APK first..."
    cd android
    ./gradlew assembleDebug
    cd ..
fi

if [ ! -f "$APK_PATH" ]; then
    echo "❌ Still no APK found. Please build it first in Android Studio."
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "✅ Found APK: $APK_PATH"
echo "📦 Size: $APK_SIZE"
echo ""

# Option 1: Upload to cloud and get link
echo "📤 Option 1: Upload to Cloud Storage"
echo "   1. Upload APK to Google Drive / Dropbox / OneDrive"
echo "   2. Get shareable link"
echo "   3. Generate QR code from link"
echo ""

# Option 2: Use local server
echo "🌐 Option 2: Share via Local Network"
echo "   1. Start local server:"
echo "      python -m http.server 8000"
echo "   2. Get your local IP:"
IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo "YOUR_LOCAL_IP")
echo "      Your IP: $IP"
echo "   3. Access from tablet: http://$IP:8000/app-debug.apk"
echo "   4. Or generate QR code with: http://$IP:8000/app-debug.apk"
echo ""

# Option 3: ADB install (if device connected)
echo "🔌 Option 3: Direct Install via ADB"
echo "   If tablet is connected via USB:"
echo "   adb install $APK_PATH"
echo ""

# Option 4: Copy to shared folder
echo "📁 Option 4: Copy to Shared Location"
echo "   APK location: $(pwd)/$APK_PATH"
echo "   Copy this file to your shared folder/network drive"
echo ""

echo "💡 Recommended: Use Google Drive for easiest sharing"
echo "   1. Upload APK to Google Drive"
echo "   2. Right-click → Get link → Anyone with link"
echo "   3. Share link via email/WhatsApp"
echo "   4. Client downloads and installs"

