# UX Flow Restoration - Implementation Summary

## ✅ Completed Changes

1. **PermanentMenuBar** - Updated to only show after paywall (`hasLifetimeAccess === true`)
2. **Menu Items** - Updated to: Home (ChakraHub), Music (SoundBath), Community (CommunityHalls), Gallery (GalleryOfGnosis)
3. **Removed Diary** - Diary/Feather removed from menu bar (replaced by green leaf button)

## 🔄 Remaining Changes Needed

### 1. FloatingNavButtons / Trial Buttons System

**Current:** Both buttons on left side, Anua navigates to ChakraHub
**Needed:**

- **Trials:** Leaf (left), Anua (bottom-right) - both open modals directly
- **Post-paywall:** Leaf (above menu bar, left), Anua (above menu bar, right)
- Anua button should open SocialSanctuaryModal (needs chakraDay/chakraName)
- Leaf button should open JourneyNotesView (bottom sheet)

### 2. Waiting Screen

**Current:** Has countdown, chakra logo with 7, clock
**Needed:** Add Chakras 101 button (left), Anua button (right)

### 3. Goodbye Modal

**Current:** Has Gallery option
**Needed:**

- Add "Home screen with chakra logo" option
- Trials: Navigate to ChakraHome with next day tease + midnight counter
- Post-paywall: Navigate to ChakraHub

### 4. ChakraHub

**Needed:** Add Chakras 101 icon to top left

---

## Technical Considerations

1. **SocialSanctuaryModal** requires `chakraDay` and `chakraName` props - FloatingNavButtons needs access to current chakra context
2. **JourneyNotesView** opens as bottom sheet - needs BottomSheetModal integration
3. **Button positioning** changes based on `hasLifetimeAccess` status
4. **Menu bar visibility** affects button positioning calculations
