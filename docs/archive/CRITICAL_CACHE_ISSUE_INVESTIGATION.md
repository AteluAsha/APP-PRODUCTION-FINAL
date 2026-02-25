# Critical Cache Issue Investigation

## ✅ Code Verification - ALL CORRECT

### Layout Order (Verified):

1. **Line 400-402**: "I will open on {formattedDate}"
2. **Line 373-457**: Countdown timer (72px boxes, 3xl text) ✅
3. **Line 459-493**: "For Deepest Embodiment" box ✅
4. **Line 495-546**: "Ask a Friend" button ✅ **CORRECTLY BELOW EMBODIMENT**
5. **Line 667-761**: Square buttons side-by-side ✅

### Anua Button (Verified):

- **Line 114-121**: `handleAnuaPress` opens chat directly ✅
- **Line 260-291**: zIndex 10001, no sanctuary text ✅
- **Line 293-299**: Only AnuaChatModal rendered ✅

### Buttons (Verified):

- **Line 667**: Container: `flex-row gap-3` ✅
- **Line 672**: Preview Course: `flex-1 aspectRatio: 1` ✅
- **Line 717**: Learn About Chakras: `flex-1 aspectRatio: 1` ✅

## ❌ Problem: iOS Build Using Cached Bundle

Despite correct code, iOS build shows:

- ❌ "Ask a Friend" is ABOVE "For Deepest Embodiment" (should be below)
- ❌ Buttons are stacked vertically (should be square side-by-side)
- ❌ Anua opens sanctuary (should open chat only)

## 🔍 Root Cause Analysis

### Possible Causes:

1. **Metro Bundler**: Serving cached JavaScript bundle
2. **iOS Build Cache**: Using pre-compiled bundle from previous build
3. **Expo Dev Client**: Cached bundle in app container
4. **NativeWind**: Tailwind styles cached and not regenerating
5. **TypeScript**: Compilation cache not clearing

### Actions Taken:

1. ✅ Killed all Expo/Metro processes
2. ✅ Cleared .expo directory
3. ✅ Cleared node_modules/.cache
4. ✅ Cleared ios/build and DerivedData
5. ✅ Uninstalled app from simulator
6. ✅ Cleared CocoaPods cache
7. ✅ Reinstalled pods
8. ✅ Started Metro with --clear --reset-cache
9. ✅ Touched files to force recompilation

## 🎯 Next Steps

1. **Complete iOS Rebuild**: `npx expo run:ios` (after Metro starts)
2. **Verify Bundle**: Check Metro terminal for bundle compilation
3. **Force Reload**: Shake device → "Reload" to force fresh bundle
4. **Check Bundle URL**: Verify Metro is serving new bundle

## ⚠️ Sentry Error (Separate Issue)

The Sentry error shows:

- **Error**: `GoogleGenerativeAI Error: [404] models/gemini-1.5-pro is not found for API version v1beta`
- **Location**: `src/services/gemini.ts` line 93
- **Issue**: API endpoint or model name may be incorrect
- **Impact**: Runtime error (doesn't affect UI/build, but Anua chat won't work)

This is a **separate issue** from the UI caching problem.
