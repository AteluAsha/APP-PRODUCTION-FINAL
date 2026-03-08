#!/usr/bin/env bash
# Verify Android dev setup: git, Metro, manifest, adb, and launch the app.
# Run from project root: npm run verify:android (or bash scripts/verify-android-dev.sh)
# Exits on first failure with a clear message.

set -e
cd "$(dirname "$0")/.."

ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
if [ ! -x "$ADB" ]; then
  ADB=adb
fi

echo "=== 1. Check git ==="
if ! git --help >/dev/null 2>&1; then
  echo "FAIL: git --help exited non-zero. Metro needs git for the manifest."
  echo "Fix: run 'sudo xcodebuild -license' in Terminal, type 'agree', then retry."
  echo "Or start Metro with: npm run start:android:no-git"
  exit 1
fi
echo "OK: git works"

echo "=== 2. Metro on 8081 ==="
if ! lsof -ti :8081 >/dev/null 2>&1; then
  echo "Metro not running. Start it in another terminal: npm run start:android"
  echo "Or: npm run start:android:no-git (if git still fails)"
  echo "Then run this script again."
  exit 1
fi
echo "OK: Metro is running"

echo "=== 3. Wait for Metro to respond ==="
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/ 2>/dev/null | grep -q 200; then
    echo "OK: Metro responded 200"
    break
  fi
  if [ "$i" -eq 10 ]; then
    echo "FAIL: Metro did not respond with 200 after 10 tries"
    exit 1
  fi
  sleep 1
done

echo "=== 4. Check manifest (no git error) ==="
MANIFEST=$(curl -s "http://localhost:8081/?dev=true&platform=android" -H "Accept: application/json" 2>/dev/null || true)
if echo "$MANIFEST" | grep -q '"error"'; then
  echo "FAIL: Manifest contains an error (often git exit 69)."
  echo "Fix: run 'sudo xcodebuild -license' and agree, then restart Metro."
  echo "Or start Metro with: npm run start:android:no-git"
  exit 1
fi
echo "OK: Manifest valid"

echo "=== 5. ADB and emulator ==="
if ! "$ADB" devices 2>/dev/null | grep -qE 'emulator|device'; then
  echo "No emulator/device found. Start an Android emulator and run this script again."
  exit 1
fi
"$ADB" reverse tcp:8081 tcp:8081 2>/dev/null || true
echo "OK: adb reverse 8081 done"

echo "=== 6. Launch app with localhost:8081 ==="
"$ADB" shell am start -n com.sevenchakras.SevenChakras/.MainActivity -a android.intent.action.VIEW \
  -d "exp+soul-school://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" 2>/dev/null || {
  echo "Launch intent sent (app may already be open). In the dev client, use http://localhost:8081 or http://10.0.2.2:8081"
}
echo "Done. Check the emulator; the app should load."
