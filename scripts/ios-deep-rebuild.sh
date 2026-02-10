#!/usr/bin/env bash
# Deep ground-up iOS rebuild: clear all bundles, caches, Expo caches, and native build artifacts.
# Use after restoration or when a fresh iOS build is needed to verify the app.
# Run from project root: ./scripts/ios-deep-rebuild.sh

set -e
cd "$(dirname "$0")/.."

echo "=== Deep iOS clean ==="

echo "Clearing Metro/Expo/Node caches..."
rm -rf node_modules/.cache .expo

if command -v watchman >/dev/null 2>&1; then
  echo "Clearing Watchman..."
  watchman watch-del-all 2>/dev/null || true
fi

[ -n "$TMPDIR" ] && rm -rf "${TMPDIR}"/metro-* "${TMPDIR}"/haste-* 2>/dev/null || true
rm -rf /tmp/metro-* /tmp/haste-* 2>/dev/null || true

echo "Clearing iOS build and Pods..."
rm -rf ios/build ios/Pods ios/Podfile.lock

echo "=== Reinstalling Pods ==="
cd ios && pod install && cd ..

echo "=== Starting fresh iOS build (this may take 5–15 minutes) ==="
npx expo run:ios
