# Static Visual Gallery - Setup Complete

## Overview

The Static Visual Gallery system is prepared for snapshot generation. All live component rendering remains **DISABLED** (quiet mode).

## Directory Structure

```
assets/dev-gallery/
├── gallery-config.ts          # Screen mapping configuration (20 screens)
├── snapshots/                 # Where snapshots will be saved (gitignored)
└── STATIC_GALLERY_README.md   # This file
```

## Gallery Configuration

The `gallery-config.ts` file contains all 20 screens mapped to their entry points:

- **Trial 1:** 7 chakra screens (Root through Crown)
- **Trial 2:** 7 chakra screens (Root through Crown)
- **Thresholds:** 4 screens (Welcome, Waiting, Goodbye, Commitment Gate)
- **Sanctuary:** 2 screens (Chakra Hub, Community Halls)

## Snapshot Method (To Be Implemented)

The `SnapshotUtility.tsx` file documents the intended API. The actual capture method will be selected from:

- **Option A:** `react-native-view-shot` (most stable, works on all platforms)
- **Option B:** `expo-capture` (if available in Expo SDK)
- **Option C:** Web Canvas API (fallback for web preview)

## Current Status

✅ **Directory structure created**
✅ **Gallery config mapped (20 screens)**
✅ **Snapshot utility placeholder created**
✅ **Live component rendering DISABLED (quiet mode)**
✅ **Assets directory gitignored**

⏳ **Snapshot capture logic** - To be implemented after selecting capture method
⏳ **Gallery carousel UI** - To be implemented tomorrow

## Next Steps

1. **Select capture method** - Choose react-native-view-shot or expo-capture
2. **Implement capture logic** - Update SnapshotUtility.tsx with actual capture code
3. **Test snapshot generation** - Verify screens can be captured without navigation errors
4. **Build gallery carousel** - Create the static image viewer (tomorrow)

## Quiet Mode Status

All live component rendering is **DISABLED**:
- ✅ StorybookShell.tsx → returns null
- ✅ SafeRoomWrapper.tsx → bypasses navigation
- ✅ DevGalleryTrigger.tsx → returns null
- ✅ app/_layout.tsx → no dev imports

The web preview shows the normal app only. No errors. No live injection.

## File Locations

- **Config:** `assets/dev-gallery/gallery-config.ts`
- **Utility:** `components/dev/SnapshotUtility.tsx`
- **Snapshots:** `assets/dev-gallery/snapshots/` (gitignored)

---

**Prepared for:** Static Visual Gallery implementation
**Status:** Staged and ready
**System:** Quiet and error-free ✅
