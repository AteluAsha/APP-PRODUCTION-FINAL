#!/bin/bash
# Force complete fresh build – run this when main course layout is broken
# Ensures Metro/Expo serve the latest ParallaxScrollView and Babel config

set -e
cd "$(dirname "$0")"

echo "=== Killing any running Metro/Expo ==="
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

echo "=== Clearing all caches ==="
rm -rf node_modules/.cache
rm -rf .expo
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-* 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true

echo "=== ParallaxScrollView check (no spacer) ==="
grep -q "no spacer" components/ParallaxScrollView.tsx && echo "  ✓ ParallaxScrollView has no spacer" || echo "  ✗ WARNING: ParallaxScrollView may still have spacer"

echo "=== Starting Expo with --clear ==="
echo "  Run: npx expo start --clear"
echo "  Then press 'i' for iOS simulator"
echo ""
echo "  Or for full native rebuild: npx expo run:ios --no-build-cache"
echo ""

npx expo start --clear
