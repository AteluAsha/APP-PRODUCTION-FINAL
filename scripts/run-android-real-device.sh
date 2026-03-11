#!/usr/bin/env bash
# Run the app on a real Android device with Metro. The device must load the JS
# bundle from your computer, so we set REACT_NATIVE_PACKAGER_HOSTNAME to your
# machine's LAN IP (not 10.0.2.2, which is emulator-only).
#
# Prerequisites: device connected via USB with USB debugging, or wireless ADB.
# Same Wi‑Fi as your computer. Run from project root: npm run android:device

set -e
cd "$(dirname "$0")/.."

# Prefer WiFi interface on macOS; fallback to any non-loopback
if command -v ipconfig >/dev/null 2>&1; then
  HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
fi
if [ -z "$HOST_IP" ] && command -v ip >/dev/null 2>&1; then
  HOST_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}' || true)
fi
if [ -z "$HOST_IP" ]; then
  echo "Could not detect LAN IP. Set REACT_NATIVE_PACKAGER_HOSTNAME to your computer's IP (e.g. 192.168.1.x) and run:"
  echo "  REACT_NATIVE_PACKAGER_HOSTNAME=<your-ip> env -u CI npx expo run:android"
  exit 1
fi

echo "Using packager host: $HOST_IP (device and computer must be on same Wi‑Fi)"
export REACT_NATIVE_PACKAGER_HOSTNAME="$HOST_IP"
env -u CI npx expo run:android
