#!/bin/bash
# Bypass splash + clear caches + rebuild iOS simulator.
# Restore splash later: in app/_layout.tsx set SPLASH_BYPASS = false

set -e
cd "$(dirname "$0")/.."
echo "Clearing caches and rebuilding iOS (splash bypassed – app opens to Welcome)..."

# Kill Metro/Expo
pkill -f "expo|metro" 2>/dev/null || true
sleep 2

# Metro + Expo caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf "$TMPDIR/metro-"* "$TMPDIR/haste-"* "$TMPDIR/react-"* 2>/dev/null || true

# iOS build cache
rm -rf ios/build

# Uninstall app from booted simulator so we get a clean install
xcrun simctl uninstall booted com.sevenchakras.SevenChakras 2>/dev/null || true

echo "Starting iOS build (Metro cache already cleared above)..."
npx expo run:ios

echo "Done. App should open to Welcome screen."
