# iOS Display Fixes Plan – Redundant Title & Back Arrow Rebuild

## Overview

Critical fixes for App1 and App2 (days 1-7):
1. Remove redundant top chakra title from chakra detail pages
2. Rebuild ALL back arrows – white arrow only, no background, no grey circle
3. Verify all back navigation works systematically

---

## Phase 1: Remove Redundant Top Title

### Problem
Chakra detail pages (e.g., Solar Plexus Day 3) show the chakra name **twice**:
- In the top nav bar area: "Solar Plexus Chakra" (redundant, competes with hero)
- In the hero content: "Day 3" + "Solar Plexus Chakra" + subtitle (correct)

### Solution
- **File:** `components/chakras/ChakraTemplate.tsx`
- Remove the fixed title block (lines 158–176) that displays `content.header.textLine2`
- Remove the spacer `View` (line 196, height: 100) used for the fixed title
- Content begins with hero → "Day X" + chakra name + subtitle (HeaderSection)

### Affected
- All 7 chakra days (Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown)
- Single template serves both App1 (trial) and App2 (lifetime)

---

## Phase 2: Back Arrow Audit & Rebuild

### Root Cause (Grey Circle)
Per `BACK_ARROW_GREY_CIRCLE_DIAGNOSIS.md`: Screens using **ActionBarAnimated** with `headerLeft` get a grey circle from **native iOS** – we cannot style it away when the button lives in the native header.

**Fix:** Stop using the native header for the back button. Use `headerShown: false` and render a custom back button as screen content (same pattern as ActionBar).

### Back Arrow Inventory

| Screen | Component | Current State | Action |
|--------|-----------|---------------|--------|
| **[chakra] (ChakraTemplate)** | ActionBarAnimated | Grey circle (headerLeft) | Refactor to custom back |
| **Chakras101** | ActionBarAnimated | Grey circle | Refactor to custom back |
| **HeadToHeart** | ActionBarAnimated | Grey circle | Refactor to custom back |
| **ChakraHub** | ActionBar | OK (no circle) | Verify styling |
| **SoundBath** | ActionBar | OK | Verify |
| **AudioLibrary** | ActionBar | OK | Verify |
| **EnergyExchange** | ActionBar | OK | Verify |
| **AccountabilityOfAwakening** | ActionBar | OK | Verify |
| **GalleryOfGnosis** | ActionBar | OK | Verify |
| **NotesAlongTheWay** | ActionBar | OK | Verify |
| **Donate** | ActionBar | OK | Verify |
| **DateSelection** | Custom Pressable | Transparent – OK | Verify |
| **WaitingScreen** | Custom Pressable | **Has bg + borderRadius** | Remove bg/circle |
| **PreviewJourney** | Custom Pressable | Transparent – OK | Verify |
| **CoursePreview** | Custom Pressable | **Has bg, border, borderRadius** | Remove bg/circle |
| **QuizScreen** | Custom Pressable (2 places) | **Has bg + borderRadius** | Remove bg/circle |
| **ChakraCardRevealModal** | ActionBar (X button) | OK (close, not back) | N/A |
| **AudioPlayer** | ActionBar (X button) | OK | N/A |
| **CommunityHallsScreen** | Custom | Check styling | Verify |
| **SocialSanctuaryModal** | Custom | Check styling | Verify |

### Missing Back Arrows
- No screens identified as missing a back arrow where one is expected.

### Design Spec (All Back Arrows)
- **Icon:** `Ionicons` `arrow-back`, size 24, color white (`#FFFFFF` or `rgba(255,255,255,0.9)`)
- **Background:** None (`transparent`)
- **Border/outline:** None
- **Position:** Top-left, with safe area insets
- **Hit slop:** 10–15px all sides

---

## Phase 3: ActionBarAnimated Refactor

### Current
- `headerShown: true` + `headerLeft` → back button in native header → grey circle on iOS

### Target
- `headerShown: false`
- Render back button as absolutely positioned `TouchableOpacity` in screen content (like ActionBar)
- Render animated header bar as overlay when scrolled (not native header)

### Implementation
1. Set `headerShown: false` in `Stack.Screen` options
2. Remove `headerLeft`, `headerBackground`, `headerTitle`, `headerTransparent`
3. Return a `View` containing:
   - Absolutely positioned back button (top-left, white arrow, no bg)
   - Absolutely positioned `Animated.View` for the scroll-triggered header bar (black bar + optional chakra image)
4. Ensure back button has higher z-index than header bar

---

## Phase 4: Shared BackArrow Component (Optional but Recommended)

Create `components/BackArrow.tsx`:
- Props: `onPress`, `size?`, `color?`, `accessibilityLabel?`
- Renders: `TouchableOpacity` with `Ionicons` arrow-back, transparent background
- Use across ActionBar, ActionBarAnimated, DateSelection, WaitingScreen, CoursePreview, QuizScreen, PreviewJourney for consistency

---

## Phase 5: Navigation Verification

Ensure every back arrow:
- Uses `router.back()` or a custom `onBackPress` that navigates correctly
- Returns to the logically previous screen (e.g., ChakraTemplate → ChakraHome/ChakraHub, Chakras101 → WaitingScreen or ChakraHome depending on mode)

### Special Cases
- **Chakras101:** `onBackPress` uses `router.replace` to ChakraHome when in waiting-room context
- **EnergyExchange:** Custom `onBackPress` for correct home routing

---

## Files to Modify

1. `components/chakras/ChakraTemplate.tsx` – Remove redundant title block and spacer
2. `components/ActionBarAnimated.tsx` – Refactor: headerShown false, custom back button
3. `components/BackArrow.tsx` – **Create** shared component
4. `components/ActionBar.tsx` – Use BackArrow (optional)
5. `components/chakras/WaitingScreen.tsx` – Remove background from back button
6. `app/(chakras)/CoursePreview.tsx` – Remove background/border from back button
7. `app/(chakras)/QuizScreen.tsx` – Remove background from back button (2 places)
8. `app/(chakras)/DateSelection.tsx` – Use BackArrow or ensure transparent (verify)

---

## Implementation Complete ✅

All fixes applied. See `BACK_ARROW_AUDIT_LOG.md` for full inventory.

## Verification Checklist

- [x] Chakra pages 1–7: No redundant title, content starts with "Day X" in hero
- [x] ChakraTemplate: Back arrow white only, no grey circle
- [x] Chakras101: Back arrow white only, no grey circle
- [x] HeadToHeart: Back arrow white only, no grey circle
- [x] All custom back arrows: No background, no border, no circle
- [x] All back arrows navigate to previous screen correctly
