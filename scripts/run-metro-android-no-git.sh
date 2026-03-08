#!/usr/bin/env bash
# Start Metro for Android emulator with a fake `git` in PATH so Expo does not
# fail when Xcode license is not accepted (git exit 69). Use when you cannot
# run sudo xcodebuild -license. Run from project root: npm run start:android:no-git

set -e
cd "$(dirname "$0")/.."

FAKEGIT_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t fakegit)
trap 'rm -rf "$FAKEGIT_DIR"' EXIT

echo "#!/bin/sh
exit 0" > "$FAKEGIT_DIR/git"
chmod +x "$FAKEGIT_DIR/git"

export PATH="$FAKEGIT_DIR:$PATH"
echo "Starting Metro for Android (fake git in PATH so manifest succeeds)..."
REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2 env -u CI npx expo start --clear
