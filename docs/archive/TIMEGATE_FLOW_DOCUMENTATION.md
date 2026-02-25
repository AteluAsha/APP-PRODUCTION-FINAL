# Timegate Flow Documentation

## Complete User Journey Flow

### Phase 1: New User → First Trial

1. **User opens app** → Welcome screen appears
2. **User presses "Begin"** → App locks until next Monday
3. **Waiting screen** → Shows countdown to Monday
   - Gallery button appears if user has unlocked cards (from previous sessions if any)
4. **Monday arrives** → Trial 1 starts automatically
5. **User completes days** → Chakras unlock day by day
6. **Sunday (Day 7)** → All chakras unlocked
7. **Trial 1 ends** → `resetJourney()` called
   - `completedChakras` resets to `[]`
   - `completedTrialCourses` increments to `1`
   - `trialHistory` records Trial 1 completion
   - **Gallery remains accessible** via `hasEverCompletedChakra()` which checks `trialHistory`

### Phase 2: Between Trials → Waiting Room

1. **After Trial 1 ends** → Waiting screen appears
   - Shows countdown to next Monday
   - **Gallery button visible** (if cards unlocked)
   - Preview button available
   - Summary button available
2. **User can access**:
   - ✅ Gallery of Gnosis (their unlocked chakra cards)
   - ✅ Preview journey
   - ✅ Journey summary
   - ❌ No chakra content (locked until next Monday)

### Phase 3: Second Trial

1. **Next Monday arrives** → Trial 2 starts automatically
2. **User completes days** → Chakras unlock day by day
3. **Sunday (Day 7)** → All chakras unlocked
4. **Trial 2 ends** → `resetJourney()` called
   - `completedChakras` resets to `[]`
   - `completedTrialCourses` increments to `2`
   - `trialHistory` records Trial 2 completion
   - **Gallery remains accessible** via `hasEverCompletedChakra()`

### Phase 4: After Both Trials → Paywall

1. **After Trial 2 ends** → CommitmentGate (paywall) appears
   - `completedTrialCourses === 2`
   - `hasLifetimeAccess === false`
   - **Gallery button visible** (if cards unlocked)
2. **User can access**:
   - ✅ Gallery of Gnosis (their unlocked chakra cards)
   - ❌ No chakra content (locked until payment)
   - ❌ No preview (locked until payment)
3. **User pays or chooses scholarship** → `grantLifetimeAccess()` called
   - `hasLifetimeAccess = true`
   - `paymentStatus = 'paid' | 'scholarship'`

### Phase 5: After Payment → Full Access

1. **User has lifetime access** → All timegates bypassed
2. **User can**:
   - ✅ Navigate app fully (all chakras accessible anytime)
   - ✅ Access gallery
   - ✅ Access all features
   - ✅ **Option to "walk the path again"** (open version of trial - all days accessible but can follow the weekly structure)

## Key Implementation Details

### Gallery Persistence

- **Function**: `hasEverCompletedChakra(chakraIndex)`
- **Logic**: Checks `trialHistory` to see if a chakra was ever completed across all trials
- **Result**: Cards persist even after trials end and `completedChakras` resets

### Timegate Logic

- **Trial Phase** (`completedTrialCourses < 2`):
  - Chakras unlock day by day
  - Weekly reset on Monday if not completed
  - Gallery accessible via `hasEverCompletedChakra()`
- **Paywall Phase** (`completedTrialCourses === 2 && !hasLifetimeAccess`):
  - All chakras locked
  - Gallery accessible via `hasEverCompletedChakra()`
  - CommitmentGate shown
- **Lifetime Access** (`hasLifetimeAccess === true`):
  - All timegates bypassed
  - All chakras accessible anytime
  - Can navigate freely or follow weekly structure

### Gallery Access Points

1. **Waiting Screen** → Gallery button (if cards unlocked)
2. **CommitmentGate (Paywall)** → Gallery button (if cards unlocked)
3. **Main App** → Gallery button in navigation (always available)

### Trial Reset Logic

When `resetJourney()` is called:

- ✅ Resets: `completedChakras`, `participatedDays`, `allChakrasCompleted`, `journeyStarted`
- ❌ Preserves: `completedTrialCourses`, `trialHistory`, `hasLifetimeAccess`, `totalDaysParticipated`, `totalChakrasCompleted`

This ensures:

- Gallery cards persist (via `trialHistory`)
- Trial count persists
- Payment status persists
- Accountability stats persist

## Flow Diagram

```
New User
  ↓
Welcome Screen → Begin → Lock until Monday
  ↓
Waiting Screen (Gallery accessible if cards exist)
  ↓
Monday → Trial 1 Starts
  ↓
Complete Days → Unlock Chakras
  ↓
Sunday → Trial 1 Complete → Reset
  ↓
Waiting Screen (Gallery accessible)
  ↓
Next Monday → Trial 2 Starts
  ↓
Complete Days → Unlock Chakras
  ↓
Sunday → Trial 2 Complete → Reset
  ↓
CommitmentGate/Paywall (Gallery accessible)
  ↓
Payment/Scholarship → Lifetime Access
  ↓
Full App Access (All features unlocked)
```

## Testing Checklist

- [ ] New user sees welcome screen
- [ ] Welcome screen shows trial info (subtle)
- [ ] Welcome screen shows lock warning (gentle)
- [ ] After "Begin", waiting screen appears
- [ ] Waiting screen shows countdown correctly
- [ ] Gallery button appears on waiting screen if cards unlocked
- [ ] Trial 1 starts on Monday
- [ ] Chakras unlock day by day
- [ ] After Trial 1 ends, gallery still accessible
- [ ] Trial 2 starts on next Monday
- [ ] After Trial 2 ends, gallery still accessible
- [ ] Paywall appears after Trial 2
- [ ] Gallery button appears on paywall if cards unlocked
- [ ] After payment, full access granted
- [ ] Gallery works correctly with `hasEverCompletedChakra()`
