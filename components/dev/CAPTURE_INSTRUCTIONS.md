# Capture Instructions - One-Time Snapshot Generation

## Overview

This document explains how to capture all 20 screens as PNGs for the Static Gallery.

## Method 1: Automatic Capture (Recommended)

### Step 1: Install html2canvas

```bash
npm install html2canvas @types/html2canvas
```

### Step 2: Activate CaptureAll

In `app/_layout.tsx`, uncomment the CaptureAll section:

```typescript
// ONE-TIME CAPTURE: Uncomment to capture all screens
const { CaptureAll } = require('@/components/dev/CaptureAll')
return (
  <View style={{ flex: 1, backgroundColor: '#000' }}>
    <CaptureAll onComplete={() => console.log('Capture complete!')} />
  </View>
)
```

### Step 3: Run Web Preview

```bash
npx expo start --web
```

### Step 4: Wait for Capture

- The component will automatically cycle through all 20 screens
- Each screenshot will download to your Downloads folder
- Filenames match the gallery-config.ts exactly

### Step 5: Move Screenshots

Move all downloaded PNGs to:

```
assets/dev-gallery/snapshots/
```

### Step 6: Disable CaptureAll

Comment out the CaptureAll section in `app/_layout.tsx` and restore StaticGallery.

---

## Method 2: Manual Capture (Fallback)

If html2canvas is not available, use browser DevTools:

### Step 1: Activate CaptureAll

Same as Method 1, Step 2.

### Step 2: Run Web Preview

```bash
npx expo start --web
```

### Step 3: Manual Screenshot

For each screen:

1. Wait for the screen to render (3 seconds)
2. Open DevTools (F12 or Cmd+Option+I)
3. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
4. Type "Capture screenshot"
5. Save with the filename shown in console

### Step 4: Save to Snapshots

Save all screenshots to:

```
assets/dev-gallery/snapshots/
```

With exact filenames from gallery-config.ts:

- `trial1-root-day1.png`
- `trial1-sacral-day2.png`
- ... (all 20 screens)

---

## Expected Filenames (20 Total)

### Trial 1 (7 screens):

- `trial1-root-day1.png`
- `trial1-sacral-day2.png`
- `trial1-solar-day3.png`
- `trial1-heart-day4.png`
- `trial1-throat-day5.png`
- `trial1-third-eye-day6.png`
- `trial1-crown-day7.png`

### Trial 2 (7 screens):

- `trial2-root-day1.png`
- `trial2-sacral-day2.png`
- `trial2-solar-day3.png`
- `trial2-heart-day4.png`
- `trial2-throat-day5.png`
- `trial2-third-eye-day6.png`
- `trial2-crown-day7.png`

### Thresholds (4 screens):

- `threshold-welcome.png`
- `threshold-waiting.png`
- `threshold-goodbye.png`
- `threshold-commitment-gate.png`

### Sanctuary (2 screens):

- `sanctuary-chakra-hub.png`
- `sanctuary-community.png`

---

## After Capture

1. ✅ All 20 PNGs in `assets/dev-gallery/snapshots/`
2. ✅ Disable CaptureAll in `app/_layout.tsx`
3. ✅ StaticGallery will automatically display the screenshots
4. ✅ Gallery is now "visually alive" with real screenshots!

---

## Troubleshooting

**Issue: Screenshots show navigation errors**

- This is expected during capture
- The screenshots will still capture the visual content
- Navigation errors don't affect the image capture

**Issue: html2canvas not working**

- Use Method 2 (Manual Capture)
- Or check browser console for errors

**Issue: Screenshots not displaying in gallery**

- Verify filenames match exactly (case-sensitive)
- Check that files are in `assets/dev-gallery/snapshots/`
- Refresh the web preview

---

**Status:** Ready for capture! 🎨📸
