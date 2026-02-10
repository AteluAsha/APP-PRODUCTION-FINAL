# UX restoration: buttons, icons, menu bar (surgical, no new designs)

Same root cause as imagery: **Pressables, Views, and Images that relied only on `className` for size/position** were not getting those styles when NativeWind doesn’t apply, so buttons and icon containers could render with no size or wrong position. Explicit **`style`** was added so all critical controls and icons are visible and tappable.

---

## Global pattern

- **Before:** `Pressable` / `View` with e.g. `className="absolute top-12 left-6 w-10 h-10 rounded-full ..."` → no dimensions or position when `className` doesn’t apply.
- **After:** Same components now have **`style={{ position, top/left/right/bottom, width, height, ... }}`** so layout and hit area are correct regardless of NativeWind.

---

## Page-by-page fixes

### DateSelection
- **Back button:** `style={{ position: "absolute", top: 48, left: 24, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor, alignItems, justifyContent }}`.
- **Day list chakra icons:** `style={{ width: 32, height: 32, marginRight: 16 }}` on each `Image`.
- **Footer (Begin journey):** Wrapper `View` now has `style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding, paddingBottom, backgroundColor, borderTopWidth, borderTopColor }}`.

### WelcomeModal
- **Close button wrapper:** `style={{ position: "absolute", top: 48, right: 24, zIndex: 10 }}`.
- **Close Pressable:** `style={{ width: 40, height: 40, borderRadius: 20, backgroundColor, alignItems, justifyContent }}`.
- **Day list chakra icons:** Same as DateSelection (`width: 32, height: 32, marginRight: 16`).
- **Footer:** Same pattern as DateSelection (position, insets, padding, background).

### WaitingScreen
- **Background overlay:** `View` with `className="absolute inset-0"` → `style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15 }}` and `pointerEvents="none"` so it doesn’t block taps.
- (Bottom icon bar already had explicit `style` on each Pressable.)

### AccessGrantedModal
- **Close button:** `style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor, alignItems, justifyContent }}`.

### ChakraHome
- **Learn About Chakras / Continue Your Journey:** `Pressable` now has `style={{ width: "100%" }}` so the full-width CTAs have a defined width.

### HeaderSection (chakra detail pages)
- **Drop-in / right content:** Wrapper `View` now has `style={{ position: "absolute", right: 24, bottom: 12 }}` instead of only `className="absolute right-6"`.

### AudioRow / AudioRowWithBackground
- **Row Pressable:** `style={{ width: "83.33%", alignSelf: "center", marginTop: 24, borderWidth, borderColor, overflow: "hidden" }}`.
- **Icon circle (play/pause):** `style={{ borderWidth, borderColor, borderRadius, width: 48, height: 48 (or 40), alignItems, justifyContent }}`.

### EnergyExchange
- **Share / Review / Write to us buttons:** Each `Pressable` has `style={{ width: "100%", borderWidth: 2, borderColor, paddingVertical: 24, paddingHorizontal: 32, borderRadius: 16 }}`.

### Donate
- **Donate button:** `style={{ width: "100%", paddingVertical, paddingHorizontal, borderRadius, marginBottom, backgroundColor (conditional), borderWidth, borderColor (conditional) }}`.

### MiniAudioPlayer
- **Container:** `style={{ position: "absolute", bottom: 96, left: 16, right: 16, zIndex: 40, flexDirection: "row", alignItems: "center", ... }}` (no longer only `className="absolute bottom-24 left-4 right-4 ..."`).

### RevenueCatPaywall
- **Close button:** `style={{ position: "absolute", top: 0, right: 0, padding: 8 }}`.

### CommunityFeaturePreviewModal
- **Close button:** `style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}`.

### AudioLibrary
- **Play/pause icon container:** `style={{ width: 40, height: 40, borderRadius: 20, backgroundColor, alignItems, justifyContent, marginRight: 16 }}`.

### SoundBathButton
- **Icon circle:** `style={{ borderWidth: 1, borderColor, borderRadius: 20, width: 40, height: 40, alignItems, justifyContent }}`.

### FloatingNavButtons
- **Anua button (trial and post-paywall):** Added `width: 44, height: 44` to the `Pressable` `style` so the button has a defined hit area.

---

## Menu bar and home icon

- **PermanentMenuBar:** Uses `StyleSheet` for container and items (explicit dimensions and position). It is **hidden by design** when `!hasLifetimeAccess` (trial users see FloatingNavButtons instead).
- **GlobalHomeButton:** Uses `StyleSheet` and explicit `style` for the button and image; no change.
- **FloatingNavButtons:** Uses `styles.button` (44×44) and explicit positioning; Anua Pressable now also has explicit width/height.

If the menu bar or home icon still doesn’t appear on a given screen, check that the route isn’t one where that component returns `null` (e.g. PermanentMenuBar on welcome/date selection or when not lifetime).

---

## Summary

- **Cause:** Buttons and icon wrappers that depended only on `className` for size/position could render with no dimensions or wrong layout.
- **Fix:** Added explicit `style` (position, width, height, padding, border, background where needed) to all critical Pressables, icon containers, and footers listed above.
- **Design:** No new UX or visuals; only restoration of existing layout and tap targets so buttons, icons, and menu bar behave as before.

After these changes, run the app and go through: DateSelection → WelcomeModal → WaitingScreen → Chakra detail (e.g. Root) → ChakraHub (lifetime) / ChakraHome (trial) and confirm back, close, CTAs, audio row, mini player, paywall close, donate, and nav buttons are all visible and tappable.
