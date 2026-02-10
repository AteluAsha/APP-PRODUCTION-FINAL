#!/usr/bin/env bash
# Clean Metro + clean ports, gut caches, then run Metro and iOS test.
# Run from project root: ./scripts/clean-metro-ios-test.sh
# Let the script run to completion (iOS build can take 5–15 minutes).

set -e
cd "$(dirname "$0")/.."

echo "=== Clearing ports 8081, 19000, 19001, 19002 ==="
for port in 8081 19000 19001 19002; do
  lsof -ti :$port | xargs kill -9 2>/dev/null || true
done

echo "=== Gutting caches ==="
rm -rf node_modules/.cache .expo
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del-all 2>/dev/null || true
fi
[ -n "$TMPDIR" ] && rm -rf "${TMPDIR}"/metro-* "${TMPDIR}"/haste-* 2>/dev/null || true

echo "=== Starting Metro with --clear (background) ==="
env -u CI npx expo start --clear &
METRO_PID=$!
echo "Metro PID: $METRO_PID"

echo "=== Waiting ~20s for Metro to finish initial bundle ==="
sleep 20

echo "=== Running iOS build (connects to Metro; may take 5–15 min) ==="
env -u CI npx expo run:ios --no-bundler

echo "=== Done ==="
