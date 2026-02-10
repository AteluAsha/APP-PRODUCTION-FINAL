#!/bin/bash
# Complete Cache Clear and Rebuild Script
# This script clears ALL caches and rebuilds the app from scratch

echo "🧹 Clearing ALL caches..."

# Kill all Metro/Expo processes
pkill -f "expo\|metro" 2>/dev/null || true
sleep 2

# Clear Metro bundler cache
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Clear Expo cache
rm -rf .expo
rm -rf ~/.expo

# Clear iOS build cache
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/soulschool-*

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
echo "🚀 Starting fresh build..."
echo "This will take 5-10 minutes..."
echo ""

# Start Metro with cache clear
npx expo start --clear &
METRO_PID=$!

# Wait for Metro to start
sleep 10

# Build iOS app
npx expo run:ios

# Kill Metro when done
kill $METRO_PID 2>/dev/null || true

echo ""
echo "✅ Build complete! App should now show all fixes."
