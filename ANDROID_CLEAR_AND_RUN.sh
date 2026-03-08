#!/bin/bash
# Android: clear caches and run a fresh build on emulator or connected device.
# Start an Android emulator (AVD) from Android Studio first, or connect a device with USB debugging.
# Run from repo root.

set -e
echo "Clearing caches for Android build..."

# Kill Metro/Expo
pkill -f "expo\|metro" 2>/dev/null || true
sleep 2

# Clear Watchman (if installed)
if command -v watchman >/dev/null 2>&1; then
  echo "Clearing Watchman..."
  watchman watch-del-all 2>/dev/null || true
fi

# Clear Metro/Expo caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf "$TMPDIR"/metro-* 2>/dev/null || true
rm -rf "$TMPDIR"/haste-* 2>/dev/null || true
rm -rf "$TMPDIR"/react-* 2>/dev/null || true

# Clear Android build outputs
rm -rf android/app/build
rm -rf android/build
if [ -f android/gradlew ]; then
  (cd android && ./gradlew clean 2>/dev/null) || true
fi

echo "Starting Android build and run (emulator or device)..."
echo "Keep this terminal open so Metro stays connected for reload."
echo ""

env -u CI npx expo run:android

echo ""
echo "Build complete. App should be running on your emulator or device."
