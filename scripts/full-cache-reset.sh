#!/usr/bin/env bash
# Full Metro / Expo cache reset after simulator reinstall still shows stale or broken bundles.
# Run from repo root: bash scripts/full-cache-reset.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Stopping Metro on 8081 (if any)"
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:8081 | xargs kill -9 2>/dev/null || true
fi

echo "==> Removing caches"
rm -rf node_modules/.cache \
  .expo \
  "$TMPDIR"/metro-* \
  "$TMPDIR"/haste-map-* 2>/dev/null || true

if [[ -d ios/build ]]; then
  echo "==> Removing ios/build"
  rm -rf ios/build
fi

if command -v watchman >/dev/null 2>&1; then
  echo "==> watchman watch-del-all"
  watchman watch-del-all 2>/dev/null || true
fi

echo "==> postinstall (worklets stub + patches)"
npm run postinstall

echo ""
echo "Done. Next (pick one):"
echo "  env -u CI npx expo start --clear"
echo "  env -u CI npx expo run:ios    # reinstall app + Metro together"
echo ""
