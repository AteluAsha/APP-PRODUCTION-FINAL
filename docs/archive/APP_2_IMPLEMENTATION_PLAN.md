# App 2 Implementation Plan

## Overview

Focus entirely on App 2 (Lifetime) features and ensure independence from App 1.

## Changes Required

### 1. Move Notes and Anua to PermanentMenuBar

- **Current**: FloatingNavButtons shows Notes (Leaf) and Anua buttons above menu bar for App 2
- **New**: Add Notes and Anua to PermanentMenuBar
- **Implementation**:
  - Add "notes" and "anua" items to menuItems array
  - Notes: Opens BottomSheetModal with JourneyNotesView
  - Anua: Opens SocialSanctuaryModal
  - Update MENU_ITEM_CONFIG with colors for notes and anua

### 2. Hide FloatingNavButtons for App 2

- **Current**: FloatingNavButtons shows for both App 1 and App 2
- **New**: Only show FloatingNavButtons for App 1 (trial users)
- **Implementation**: Add early return in FloatingNavButtons if hasLifetimeAccess

### 3. Add Hamburger Menu to ChakraHome (App 1) when accessed from App 2

- **Current**: No way to return to App 2 from App 1
- **New**: Show hamburger menu (3 lines) on top left of ChakraHome when hasLifetimeAccess === true
- **Implementation**:
  - Check if hasLifetimeAccess in ChakraHome
  - If true, show hamburger menu button on top left
  - Clicking hamburger navigates to ChakraHub

### 4. Verify App 2 Independence

- Ensure all App 2 features are gated by hasLifetimeAccess
- Verify no App 1 logic affects App 2
- Clean up any cross-contamination

### 5. Streamline Menu Bar UX

- Review menu bar for clarity
- Remove redundancies
- Ensure good UX flow

## Files to Modify

1. `components/navigation/PermanentMenuBar.tsx` - Add Notes and Anua items
2. `components/navigation/FloatingNavButtons.tsx` - Hide for App 2
3. `components/chakras/ChakraHome.tsx` - Add hamburger menu when from App 2
4. `components/navigation/MenuIcons.tsx` - Add Anua icon if needed
5. Verify all App 2 components are properly gated

## Implementation Order

1. ✅ Add Notes and Anua to PermanentMenuBar
2. ✅ Hide FloatingNavButtons for App 2
3. ✅ Add hamburger menu to ChakraHome
4. ✅ Verify App 2 independence
5. ✅ Review UX
