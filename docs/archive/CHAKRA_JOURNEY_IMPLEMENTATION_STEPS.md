# Chakra Journey Implementation Steps

## Step 1: Basic Day-Based Unlocking ✅

### Goal

Implement the core mechanism to unlock chakras based on the current day of the week.

### Tasks

1. **Create Date Utility Functions** ✅
   - Implement `getCurrentDayOfWeek()` to return 0-6 (Mon-Sun)
   - Implement `getNextMondayDate()` to calculate upcoming Monday

2. **Update ChakraHome Component** ✅
   - Replace hardcoded currentDay with actual day of week
   - Test visibility logic with real days
   - Keep the hidden day override button for testing

3. **Create Simple Waiting Screen** ✅
   - Basic screen with "Journey begins Monday" message
   - Show next Monday's date
   - Add conditional rendering in ChakraHome

### Testing Criteria

- Verify correct chakras show based on actual weekday ✅
- Confirm waiting screen appears on non-Monday first launch ✅
- Validate day override still works for testing ✅

## Step 2: Journey State Management ✅

### Goal

Create persistent storage for tracking user journey progress.

### Tasks

1. **Implement Basic Journey Store** ✅
   - Create `useChakraJourneyStore` with Zustand
   - Add fields: `journeyStarted`, `completedChakras`
   - Implement persistence with AsyncStorage

2. **Track Chakra Completion** ✅
   - Modify chakra detail pages to mark as viewed
   - Update existing `completedChakra` mechanism to use new store
   - Test completion tracking persists between app launches

3. **Add Journey Started Logic** ✅
   - Set `journeyStarted` to true on first Monday visit
   - Skip waiting screen if journey already started
   - Test with app restarts

### Testing Criteria

- Journey state persists between app restarts ✅
- Completed chakras are tracked correctly ✅
- Journey started status is maintained ✅

## Step 3: Waiting Screen with Preview ✅

### Goal

Enhance waiting screen with preview functionality.

### Tasks

1. **Design Minimalist Waiting Screen** ✅
   - Implement clean layout with countdown to Monday
   - Add "Preview Journey" button
   - Style according to app theme

2. **Create Preview Mode** ✅
   - Add limited Root chakra content view
   - Clearly mark as preview
   - Ensure preview doesn't count as completion

3. **Implement Navigation** ✅
   - Add routes between waiting screen and preview
   - Ensure return to waiting screen works properly

### Testing Criteria

- Preview button takes user to Root chakra preview ✅
- Preview is clearly marked as such ✅
- User can return to waiting screen ✅

## Step 4: UI Enhancements - Progression Indicator ✅

### Goal

Add visual feedback for weekly progress.

### Tasks

1. **Implement Linear Progress Indicator** ✅
   - Create M-T-W-T-F-S-S day indicator
   - Highlight current day
   - Show unlocked vs locked days

2. **Style and Position** ✅
   - Integrate indicator into ChakraHome layout
   - Ensure visibility and aesthetic fit
   - Add subtle animations for state changes

3. **Connect to Journey State** ✅
   - Update indicator based on currentDay
   - Reflect completion status visually
   - Test all day scenarios

### Testing Criteria

- Indicator accurately shows current day ✅
- Visual distinction between unlocked/locked days ✅
- Smooth integration with existing UI ✅

## Step 5: First-Time User Experience ✅

### Goal

Create smooth onboarding for new users.

### Tasks

1. **Design Welcome Modal** ✅
   - Create first-launch explanation of 7-day concept
   - Include visuals of chakra-day mapping
   - Add "Begin Journey" button

2. **Implement First-Time Detection** ✅
   - Add `isFirstLaunch` tracking
   - Show onboarding only on first app open
   - Test with fresh installs

3. **Add Context-Aware Guidance** ✅
   - Show different guidance based on weekday
   - Add tooltips for key UI elements
   - Ensure guidance doesn't interfere with usage

### Testing Criteria

- Onboarding appears only on first launch ✅
- Guidance is appropriate for current day ✅
- Journey concept is clearly explained ✅

## Step 6: Weekly Reset & Completion Logic ✅

### Goal

Implement the weekly reset mechanism and full completion rewards.

### Tasks

1.  **Add Week Tracking**
    - Store the start date of the current week
    - Check for week transitions on app launch
    - Implement `checkWeekTransition()` function (handled by `useChakraWeekTransition` hook)

2.  **Implement Full Completion Logic**
    - Track when all 7 chakras are viewed
    - Set `allChakrasCompleted` flag when achieved
    - Test that all chakras remain unlocked when completed

3.  **Create Reset Logic**
    - Reset journey if week changes and not all chakras completed
    - Create reset notification message (deferred to Notification step)
    - Test weekly transition scenarios

**Implementation Notes:**

- Updates `useChakraJourneyStore` to track `journeyWeekStartDate` and a permanent `allChakrasCompleted` flag.
- Modifies store actions (`startJourney`, `resetJourney`, `markChakraCompleted`, `checkAndSetCompletion`) to handle weekly start/reset and permanent completion.
- Creates `utils/dateUtils.ts` for week start calculation.
- Creates `useChakraWeekTransition` hook to check for week changes on app load and trigger reset if the journey is incomplete.
- Integrates `useChakraWeekTransition` into the root layout (`app/_layout.tsx`).
- Updates `ChakraHome` useEffect to correctly handle journey start/waiting screen based on the developer day override (`currentDay`) instead of `realDayOfWeek`.
- Updates `DeveloperTools` to display new store state (`Week Start`, `All Done`, `Completed #`) and adds controls to simulate week transitions and toggle the `allChakrasCompleted` flag for testing.

### Testing Criteria

- Week transitions correctly reset incomplete journeys
- Completing all chakras unlocks everything permanently
- Reset message appears appropriately

## Step 7: Developer Tools

### Goal

Create tools to facilitate testing different scenarios.

### Tasks

1. **Create Hidden Developer Panel**
   - Implement triple-tap gesture in corner to reveal
   - Add panel with testing controls
   - Include visual indicator when active

2. **Add Testing Controls**
   - Day override picker
   - Completion toggle buttons
   - Week transition simulator
   - Reset all button

3. **Implement Developer Settings Storage**
   - Persist developer mode state
   - Store override settings
   - Add ability to reset to normal mode

### Testing Criteria

- Developer panel accessible via gesture
- Controls effectively override app behavior
- Settings persist between launches

## Step 8: Notifications

### Goal

Implement reminder notifications for the journey.

### Tasks

1. **Set Up Local Notifications**
   - Add notification permissions request
   - Create notification scheduling system
   - Test basic notification delivery

2. **Create Notification Content**
   - Daily new chakra notifications
   - Evening reminders if not viewed
   - Weekend completion reminders
   - Journey completion congratulations

3. **Add User Preferences**
   - Allow enabling/disabling notifications
   - Set preferred notification times
   - Persist preferences in storage

### Testing Criteria

- Notifications trigger at appropriate times
- Content is relevant to current journey state
- User preferences are respected

## Step 9: Alternative UI Designs

### Goal

Implement alternative designs for evaluation.

### Tasks

1. **Circular Week Wheel Indicator**
   - Create circular visualization of weekdays
   - Add chakra icons for each day
   - Implement animations for transitions

2. **Chakra Stacking Indicator**
   - Design vertical stack visualization
   - Add color coding for accessibility
   - Include day labels for clarity

3. **Journey Map Waiting Screen**
   - Create visual path representation
   - Add chakra markers along the path
   - Implement interactive elements

### Testing Criteria

- Alternative designs function correctly
- Each design provides clear journey feedback
- Designs are consistent with app aesthetics

## Step 10: Final Refinement

### Goal

Polish the experience based on testing feedback.

### Tasks

1. **Performance Optimization**
   - Measure and improve render performance
   - Reduce unnecessary re-renders
   - Optimize animations for smooth experience

2. **Edge Case Handling**
   - Test and fix timezone edge cases
   - Handle date/time changes gracefully
   - Ensure proper behavior after extended app closure

3. **Visual Refinement**
   - Finalize animations and transitions
   - Ensure consistent spacing and alignment
   - Polish all UI elements for production quality

### Testing Criteria

- Feature performs well on various devices
- Edge cases handled gracefully
- UI is polished and consistent
