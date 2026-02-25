# Bundle Cache Issue - Critical

## Problem

iOS app is using a **cached JavaScript bundle** that doesn't include the latest code changes.

## Evidence

- Code is 100% correct (verified multiple times)
- File structure is correct:
  - Line 370: "I will open on {formattedDate}"
  - Line 373-460: Countdown timer
  - Line 462-496: "For Deepest Embodiment" box
  - Line 498-546: "Ask a Friend" button (BELOW embodiment)
- But iOS app shows old layout (Ask a friend ABOVE countdown)

## Root Cause

The iOS build is loading a pre-compiled or cached JavaScript bundle instead of the new bundle from Metro.

## Solution Applied

1. ✅ Added visible build marker to verify new code is running
2. ✅ Cleared ALL caches:
   - Metro bundler cache
   - Expo cache (.expo)
   - Node modules cache
   - iOS build cache
   - Xcode DerivedData
   - CocoaPods cache
3. ✅ Uninstalled app from simulator
4. ✅ Reinstalled CocoaPods
5. ✅ Started Metro with --clear --reset-cache

## Next Steps

1. **Wait for Metro to start** (check terminal output)
2. **Rebuild iOS app**: `npx expo run:ios`
3. **Check for build marker**: Look for cyan text "[BUILD v2.1]" below the date
4. **If marker appears**: New code is running, verify layout
5. **If marker doesn't appear**: Bundle is still cached, try:
   - Shake device → "Reload"
   - Check Metro terminal for bundle URL
   - Verify app is connecting to Metro (not using pre-compiled bundle)
   - Build from Xcode directly with clean build folder

## Verification

The build marker will appear as cyan text below "I will open on..." if the new bundle is loaded.
