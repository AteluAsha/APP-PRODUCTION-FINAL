#!/bin/bash
# Complete Cache Clear and Rebuild Script
# This script clears ALL caches and rebuilds the app from scratch

echo "🧹 Clearing ALL caches..."

# Kill all Metro/Expo processes
pkill -f "expo\|metro" 2>/dev/null || true
sleep 2

# Clear Watchman (if installed)
if command -v watchman >/dev/null 2>&1; then
  echo "Clearing Watchman..."
  watchman watch-del-all 2>/dev/null || true
fi

# Clear Metro bundler cache
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Clear Expo cache
rm -rf .expo
rm -rf ~/.expo

# Clear iOS build cache (project name is SoulSchool)
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/SoulSchool-*

# Clear CocoaPods cache
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all 2>/dev/null || true
cd ..

# Uninstall app from simulator
xcrun simctl uninstall booted com.sevenchakras.SevenChakras 2>/dev/null || true

echo "✅ All caches cleared!"
echo ""
echo "📦 Reinstalling CocoaPods..."
cd ios
pod install
cd ..

echo ""
echo "🚀 Starting fresh iOS build (simulator will open when build completes)..."
echo "This will take 5-15 minutes. Keep this terminal open."
echo ""

# Open Simulator first so it's ready (expo run:ios will build and launch the app into it)
open -a Simulator 2>/dev/null || true

# Build and run on iOS simulator. This starts Metro automatically after the build.
# env -u CI so the app stays connected to Metro for real-time reload (Cmd+R in simulator).
env -u CI npx expo run:ios

echo ""
echo "✅ Build complete. App should be running in the simulator."
