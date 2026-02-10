#!/usr/bin/env bash
# Fix iOS build (xcodebuild exit code 65).
# Run from project root: bash scripts/fix-ios-build.sh
#
# Common causes fixed by this script:
# - Stale Pods / header search path issues (clean + pod install).
# After a fresh npm install, if iOS build fails with Swift errors in
# expo-application or expo-notifications, see IOS_BUILD_FIX.md.

set -e
echo "Fixing iOS build..."

# 1. Ensure Xcode command-line tools point to Xcode app
if ! xcode-select -p | grep -q 'Xcode.app'; then
  echo "Pointing xcode-select to Xcode.app (may need sudo)..."
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
fi

# 2. Clean iOS build artifacts and Pods
echo "Cleaning ios/build, Pods, Podfile.lock..."
rm -rf ios/build ios/Pods ios/Podfile.lock

# 3. Reinstall pods
echo "Running pod install..."
cd ios && pod install && cd ..

echo "Done. Run: npx expo run:ios"
echo ""
echo "If build still fails with header or Swift errors, regenerate native project:"
echo "  npx expo prebuild --clean --platform ios"
echo "Then: npx expo run:ios"
