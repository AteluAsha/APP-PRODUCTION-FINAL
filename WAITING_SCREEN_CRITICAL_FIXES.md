# Waiting Screen Critical Fixes - Final Update

## Issues Identified from User Feedback

1. **"Ask a friend" positioned ABOVE countdown** (should be BELOW "For Deepest Embodiment")
2. **"For Deepest Embodiment" missing cyan border** (should have visible cyan border)
3. **Buttons NOT square and NOT side-by-side** (should be square, side-by-side)
4. **"sanctuary" text visible** (should NOT be visible - only Anua chat button)

## Fixes Applied

### 1. Button Layout - FORCE Square and Side-by-Side
**File**: `components/chakras/WaitingScreen.tsx` (Lines 576-679)

**Changes**:
- Removed `flex-1` from className (was conflicting)
- Added explicit `width: '48%'` and `maxWidth: '48%'` to force equal sizing
- Kept `aspectRatio: 1` to ensure square shape
- Added `flex: 1` in style object for proper flex behavior
- Wrapped in container with explicit width

**Before**:
```tsx
<View className="w-full max-w-sm flex-row gap-3">
  <Pressable className="active:opacity-80 flex-1" style={{ aspectRatio: 1, ... }}>
```

**After**:
```tsx
<View className="w-full flex-row gap-3" style={{ width: '100%' }}>
  <Pressable className="active:opacity-80" style={{ 
    flex: 1, 
    width: '48%', 
    aspectRatio: 1, 
    maxWidth: '48%',
    ...
  }}>
```

### 2. Cyan Border Visibility - INCREASED
**File**: `components/chakras/WaitingScreen.tsx` (Lines 472-506)

**Changes**:
- Increased `borderWidth` from `1` to `1.5`
- Increased `borderColor` opacity from `rgba(6, 182, 212, 0.3)` to `rgba(6, 182, 212, 0.6)`
- Increased `shadowOpacity` from `0.4` to `0.5`
- Increased `shadowColor` opacity from `0.2` to `0.3`

**Before**:
```tsx
borderWidth: 1,
borderColor: "rgba(6, 182, 212, 0.3)",
shadowColor: 'rgba(6, 182, 212, 0.2)',
shadowOpacity: 0.4,
```

**After**:
```tsx
borderWidth: 1.5,
borderColor: "rgba(6, 182, 212, 0.6)",
shadowColor: 'rgba(6, 182, 212, 0.3)',
shadowOpacity: 0.5,
```

### 3. FloatingNavButtons Hiding - ENHANCED
**File**: `components/navigation/FloatingNavButtons.tsx` (Lines 85-104)

**Changes**:
- Added explicit check for `ChakraHome` route (where waiting screen is rendered)
- Enhanced `isWaitingScreen` detection to include `ChakraHome` route

**Before**:
```tsx
const isWaitingScreen = isRootChakrasRoute || isWelcomeScreen
```

**After**:
```tsx
const isWaitingScreen = isRootChakrasRoute || isWelcomeScreen || segments.includes('ChakraHome') || pathname?.includes('ChakraHome')
```

### 4. Layout Order - VERIFIED CORRECT
**File**: `components/chakras/WaitingScreen.tsx`

**Current Order** (Lines 383-559):
1. Countdown Timer (Lines 385-470)
2. "For Deepest Embodiment" (Lines 472-506)
3. "Ask a Friend" (Lines 508-559)

**Status**: ✅ CORRECT - "Ask a Friend" is already below "For Deepest Embodiment"

## Cache Clearing

1. ✅ Killed all Expo/Metro/Xcode processes
2. ✅ Removed `.expo`, `node_modules/.cache`, `ios/build`
3. ✅ Uninstalled app from simulator
4. ✅ Touched `WaitingScreen.tsx` to force recompilation
5. ✅ Started Metro with `--clear --reset-cache`

## Next Steps

1. **Rebuild iOS app**: `npx expo run:ios`
2. **Verify**:
   - Buttons are square and side-by-side
   - Cyan border is visible on "For Deepest Embodiment"
   - "Ask a Friend" is below "For Deepest Embodiment"
   - No "sanctuary" text visible (only Anua icon)
   - Anua button opens chat only (not full sanctuary)

## Notes

- The code structure was already correct for layout order
- The main issues were:
  1. Button sizing (flex-1 conflict)
  2. Border visibility (opacity too low)
  3. FloatingNavButtons still rendering (route detection)

All fixes have been applied and caches cleared.
