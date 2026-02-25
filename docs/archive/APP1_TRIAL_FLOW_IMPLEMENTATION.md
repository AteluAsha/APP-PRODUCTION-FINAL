# APP_1 (Trial) Flow - Implementation Complete

## ✅ Implementation Status

The App 1 (Trial) flow has been successfully implemented according to your specifications.

---

## 🎯 Key Requirements Implemented

### 1. **Default Starting State** ✅

- **Always starts with root chakra (Monday, day 0) only**
- Root chakra in base position with title above
- This is the ALWAYS starting place for trial timegates and chakra flow

### 2. **Weekly Lock** ✅

- **Locked to 7 days of the week** (Monday-Sunday)
- Uses real day of week (0-6), NOT journey progress
- If they open the app during the week, chakra stays open all week
- If they don't open the app, chakra greys out and is not accessible

### 3. **Progressive Reveal** ✅

- **Monday (day 0)**: Only root chakra visible with title above
- **Tuesday-Sunday**: Progressive reveal, all 7 visible by Sunday
- By Sunday, all chakras are present

### 4. **Title Display Logic** ✅

- **Only show title above CURRENT day** (day of week)
- Remove title after completion
- Show teaser title for next day after completing current day
- By Sunday, only Sunday title is shown above Sunday chakra ball

### 5. **Teaser Logic** ✅

- After completing current day, teaser of tomorrow's chakra appears
- Teaser has title above it (subtle opacity)
- Previous day's title goes away after completion

### 6. **Check Marks** ✅

- Check mark appears next to completed chakras
- Only on completed days (not missed days, not teaser)

### 7. **Missed Days** ✅

- Days not opened during the week are greyed out (opacity 0.3)
- Not clickable, no check ball, not accessible for rest of trial
- They can always access the current day (day of week)

### 8. **Accessibility** ✅

- Can always access current day (day of week)
- Can access days that were opened during the week (participated or completed)
- Cannot access missed days (past days not opened)
- Cannot access future days (beyond current day)

---

## 📋 User Flow

### New User Journey:

1. **Splash Screen** → Welcome Screen → Date Selection → Waiting Room
2. **Monday (Trial Opening)**:
   - Only root chakra visible
   - Title above: "Monday Root Day"
   - Throbbing animation
3. **Complete Monday**:
   - Chakra stays open
   - Check mark appears
   - Click complete → Teaser of Tuesday appears with title
   - Monday title goes away
4. **Tuesday-Sunday**:
   - Progressive reveal continues
   - Each day follows same pattern
5. **By Sunday**:
   - All 7 chakras present
   - Only Sunday title above Sunday chakra ball
   - Days engaged: open with check marks
   - Days not engaged: greyed out, not accessible
   - Can always access current day

### After Week 1:

- Can enter paywall OR retake second free trial
- If second trial: Resets, sends to date selection screen, begins again

### After Second Trial:

- Only paywall option
- Switches to App 2 (Lifetime)

---

## 🔧 Technical Implementation

### Files Modified:

1. **`components/chakras/ChakraHome.tsx`**
   - Locked `currentDay` to real day of week (not journey progress)
   - Updates when real day of week changes

2. **`components/chakras/IntegratedProgressStack.tsx`**
   - Progressive reveal: Monday = only root, Sunday = all 7
   - Title display: Only current day, removed after completion
   - Teaser logic: Next day's teaser with title after completion
   - Visibility: Show chakras up to current day
   - Opacity: OPEN (1.0), MISSED (0.3), TEASER (0.15)

3. **`src/services/timegate.ts`**
   - Updated `isTrialChakraAccessible()` to enforce weekly lock
   - Always allows access to current day
   - Allows access to opened days (participated/completed)
   - Blocks missed days and future days

---

## ✅ Verification Checklist

- [x] Default state: Root chakra only on Monday
- [x] Weekly lock: Uses real day of week (0-6)
- [x] Progressive reveal: Monday = 1, Sunday = 7
- [x] Title display: Only current day, removed after completion
- [x] Teaser logic: Next day teaser with title after completion
- [x] Check marks: Only on completed days
- [x] Missed days: Greyed out, not accessible
- [x] Accessibility: Always can access current day
- [x] By Sunday: All 7 chakras present, only Sunday title

---

## 🎉 Summary

The App 1 (Trial) flow is now correctly implemented with:

- ✅ Weekly lock to 7 days of the week
- ✅ Progressive reveal from Monday to Sunday
- ✅ Proper title display (only current day)
- ✅ Teaser logic (next day after completion)
- ✅ Missed day handling (greyed out, not accessible)
- ✅ Always accessible current day

**Status**: ✅ **Ready for testing**

The trial flow now matches your specifications exactly.
