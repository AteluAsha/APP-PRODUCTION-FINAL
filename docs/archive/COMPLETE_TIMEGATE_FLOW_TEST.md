# Complete Timegate Flow Test Documentation

## Flow Overview

### Phase 1: New User Onboarding

1. **User opens app** → Welcome screen appears
2. **Welcome screen shows**:
   - Subtle trial info ("Two Free Trials")
   - Gentle lock warning (app locks until next Monday)
   - "Begin Your Journey" button
   - "Healing Through Connection" (Invite a Friend) button
3. **User presses "Begin"** → App locks, `initialOpenDate` set, `courseStartDate` calculated
4. **Waiting screen appears** → Shows countdown to next Monday
   - Gallery button (if cards exist from previous sessions)
   - Preview button
   - Summary button

### Phase 2: Trial 1

1. **Monday arrives** → Trial 1 auto-starts (`completedTrialCourses === 0`)
2. **User opens a few days/chakras** → Cards unlock
   - Each completed chakra is tracked in `completedChakras`
   - Each day is tracked in `participatedDays`
   - Trial history is updated with `daysParticipated`
3. **Sunday (Day 7)** → Trial 1 ends
   - `resetJourney()` is called by `useChakraWeekTransition`
   - `completedChakras` resets to `[]`
   - `completedTrialCourses` increments to `1`
   - `trialHistory` records Trial 1 completion
   - **Gallery cards persist** via `hasEverCompletedChakra()` checking `trialHistory`

### Phase 3: Between Trials (After Trial 1)

1. **Waiting screen appears** → Shows "Begin Again" message
   - Title: "Begin Again"
   - Subtitle: "Your second trial begins on [next Monday]"
   - **"Begin Again" button** (only visible on Monday)
   - Gallery button (shows cards from Trial 1)
   - Summary button
   - Countdown to next Monday
2. **User must press "Begin Again"** → Trial 2 does NOT auto-start
3. **On Monday, user presses "Begin Again"** → Trial 2 starts

### Phase 4: Trial 2

1. **Trial 2 starts** → User can open chakras
2. **User opens a couple more chakras** → More cards unlock
   - Cards from Trial 1 still visible
   - New cards from Trial 2 added
3. **Sunday (Day 7)** → Trial 2 ends
   - `resetJourney()` is called
   - `completedChakras` resets to `[]`
   - `completedTrialCourses` increments to `2`
   - `trialHistory` records Trial 2 completion
   - **Gallery shows ALL cards from both trials** via `hasEverCompletedChakra()`

### Phase 5: Landing Screen (After Trial 2)

1. **Special landing screen appears** → Shows "Your Journey Awaits"
   - Title: "Your Journey Awaits"
   - Subtitle: "You've completed both trials. Continue your path with lifetime access."
   - **NO countdown** (no more waiting)
   - **"Continue Your Journey" button** → Opens paywall
   - **"View Your Chakra Cards" button** → Opens gallery (shows all cards from both trials)
   - Resting place with healing energy

### Phase 6: Paywall

1. **User presses "Continue Your Journey"** → CommitmentGate appears
   - Annual Access option
   - Scholarship option
   - Gallery button (if cards unlocked)
2. **User pays or chooses scholarship** → `grantLifetimeAccess()` called
   - `hasLifetimeAccess = true`
   - `paymentStatus = 'paid' | 'scholarship'`
3. **Full app access granted** → All timegates bypassed
   - All chakras accessible anytime
   - Can navigate freely or follow weekly structure
   - Gallery accessible

## Key Implementation Details

### Auto-Start Logic

- **Trial 1**: Auto-starts on Monday if `completedTrialCourses === 0`
- **Trial 2**: Does NOT auto-start - user must press "Begin Again"
- **After Trial 2**: Shows landing screen, then paywall

### Gallery Persistence

- Uses `hasEverCompletedChakra(chakraIndex)` which:
  1. Checks current `completedChakras` array
  2. Checks all `trialHistory` entries for `daysParticipated`
  3. Returns `true` if chakra was ever completed in any trial

### Waiting Screen States

- **Before Trial 1**: Normal waiting screen with countdown
- **After Trial 1** (`completedTrialCourses === 1`):
  - "Begin Again" title
  - "Begin Again" button (only on Monday)
  - Gallery button
  - Summary button
  - Countdown to next Monday
- **After Trial 2** (`completedTrialCourses === 2`):
  - "Your Journey Awaits" title
  - "Continue Your Journey" button (opens paywall)
  - Gallery button
  - NO countdown

### Week Transition Logic

- `useChakraWeekTransition` hook:
  - Detects week rollover
  - Calls `resetJourney()` when week changes
  - Does NOT auto-start Trial 2 (user must press "Begin Again")

## Testing Checklist

- [ ] New user sees welcome screen
- [ ] Welcome screen shows trial info and lock warning
- [ ] After "Begin", waiting screen appears with countdown
- [ ] Trial 1 auto-starts on Monday
- [ ] User can open chakras and unlock cards in Trial 1
- [ ] After Trial 1 ends, waiting screen shows "Begin Again"
- [ ] "Begin Again" button only appears on Monday
- [ ] Gallery shows cards from Trial 1 after reset
- [ ] Trial 2 does NOT auto-start
- [ ] User must press "Begin Again" to start Trial 2
- [ ] User can open more chakras in Trial 2
- [ ] After Trial 2 ends, landing screen appears
- [ ] Landing screen shows "Your Journey Awaits"
- [ ] Landing screen has "Continue Your Journey" button
- [ ] Gallery shows ALL cards from both trials
- [ ] "Continue Your Journey" opens paywall
- [ ] Paywall shows gallery button
- [ ] After payment, full access granted
- [ ] All chakras accessible after payment

## Code Files Modified

1. **`hooks/useChakraJourneyStore.ts`**:
   - Added `hasEverCompletedChakra()` function
   - Tracks chakras across all trials via `trialHistory`

2. **`hooks/useChakraWeekTransition.ts`**:
   - Updated to include `completedTrialCourses` in dependencies
   - Does NOT auto-start Trial 2

3. **`components/chakras/ChakraHome.tsx`**:
   - Modified auto-start logic to only work for Trial 1
   - Added props to WaitingScreen for trial status
   - Added "Begin Again" handler

4. **`components/chakras/WaitingScreen.tsx`**:
   - Added conditional rendering based on `completedTrialCourses`
   - Added "Begin Again" button for Trial 2
   - Added landing screen for after Trial 2
   - Hides countdown after Trial 2

5. **`app/(chakras)/GalleryOfGnosis.tsx`**:
   - Uses `hasEverCompletedChakra()` instead of `hasCompletedChakra()`
   - Shows all cards from all trials

6. **`components/chakras/CommitmentGate.tsx`**:
   - Added gallery button (if cards unlocked)

## Flow Diagram

```
New User
  ↓
Welcome Screen (trial info, lock warning)
  ↓
Begin → Lock until Monday
  ↓
Waiting Screen (countdown)
  ↓
Monday → Trial 1 Auto-Starts
  ↓
Open Chakras → Cards Unlock
  ↓
Sunday → Trial 1 Ends → Reset
  ↓
Waiting Screen ("Begin Again")
  ↓
Monday + Press "Begin Again" → Trial 2 Starts
  ↓
Open More Chakras → More Cards Unlock
  ↓
Sunday → Trial 2 Ends → Reset
  ↓
Landing Screen ("Your Journey Awaits")
  ↓
Press "Continue Your Journey" → Paywall
  ↓
Pay/Scholarship → Lifetime Access
  ↓
Full App Access
```
