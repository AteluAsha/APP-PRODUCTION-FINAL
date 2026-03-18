#!/usr/bin/env bash
# Kill Metro/Expo/xcodebuild, free ports, start Metro with --clear, then run iOS build.
# Run from project root: ./scripts/run-ios-with-metro.sh
# If the build hangs at "Hermes Replace..." for 10+ min: stop it (Ctrl+C), open
# ios/SoulSchool.xcworkspace in Xcode, choose iPhone simulator, Product > Run.
# Keep Metro running (npx expo start --clear) so the app loads the bundle.

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Killing Metro, Expo, xcodebuild..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "expo run:ios" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "xcodebuild" 2>/dev/null || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
lsof -ti :19000 | xargs kill -9 2>/dev/null || true
lsof -ti :19001 | xargs kill -9 2>/dev/null || true
sleep 2
echo "Starting Metro with --clear (background)..."
env -u CI npx expo start --clear &
METRO_PID=$!
sleep 12
if ! kill -0 $METRO_PID 2>/dev/null; then
  echo "Metro failed to start."
  exit 1
fi
echo "Metro running. Building and installing app on simulator..."
env -u CI npx expo run:ios --no-bundler --device "iPhone 17 Pro"
echo "Done. Reload app in simulator with Cmd+R if needed."
