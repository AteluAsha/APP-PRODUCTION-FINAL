#!/usr/bin/env bash
# Full cache clear and run iOS so Metro serves a fresh bundle.
# Use when you see stale UI (e.g. old placeholder welcome) or simulator not getting new code.
# Stop any running Metro (Ctrl+C) before running this.

set -e
cd "$(dirname "$0")/.."

echo "Clearing all Metro/Expo/Watchman caches..."

rm -rf node_modules/.cache .expo

if command -v watchman >/dev/null 2>&1; then
  echo "Clearing Watchman..."
  watchman watch-del-all 2>/dev/null || true
fi

if [ -n "$TMPDIR" ]; then
  echo "Clearing TMPDIR Metro/Haste caches..."
  rm -rf "${TMPDIR}"/metro-* "${TMPDIR}"/haste-map-* 2>/dev/null || true
fi

# Metro cache can also live here on some setups
rm -rf /tmp/metro-* /tmp/haste-map-* 2>/dev/null || true

echo "Running iOS (Metro will start with clean state)..."
npx expo run:ios
