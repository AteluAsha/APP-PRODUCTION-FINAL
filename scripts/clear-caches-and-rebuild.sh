#!/usr/bin/env bash
# Clear Metro and Expo caches then rebuild iOS. Use when opening sequence or
# bundle seems wrong (e.g. app loads straight to chakra home, stale UI).
# Run from project root: ./scripts/clear-caches-and-rebuild.sh

set -e
cd "$(dirname "$0")/.."

echo "=== Killing Metro and dev servers on 8081, 19000–19002 ==="
for port in 8081 19000 19001 19002; do
  lsof -ti :$port | xargs kill -9 2>/dev/null || true
done
sleep 1

echo "=== Clearing caches ==="
rm -rf node_modules/.cache
rm -rf .expo
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del-all 2>/dev/null || true
fi
[ -n "$TMPDIR" ] && rm -rf "${TMPDIR}"/metro-* "${TMPDIR}"/haste-* 2>/dev/null || true

echo "=== Caches cleared. Start Metro with a clean bundle: ==="
echo "  npx expo start --clear"
echo "Then in another terminal run iOS:"
echo "  npx expo run:ios"
echo ""
echo "Or run full clean iOS build (no Metro reuse):"
echo "  npx expo run:ios --no-bundler"
echo "  (then start Metro with: npx expo start --clear)"
exit 0
