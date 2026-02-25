# Time Sync & Timegate Audit – February 2026

**Scope:** Date syncing with timegates, Android/iOS compatibility, timezone handling, payment status sync, potential reset/crash scenarios.

---

## 1. Fixes Applied

### 1.1 UTC vs Local Date Bugs (CRITICAL)

**Problem:** `new Date().toISOString().split("T")[0]` returns the date in **UTC**, not local time. Users in Tokyo at 1am Tuesday would get Monday's date; west-coast users in the evening could get the wrong day.

**Fix:** Added `getLocalDateISO()` in `utils/date.ts` – returns YYYY-MM-DD using `getFullYear()`, `getMonth()`, `getDate()` (all local).

**Files updated:**

- `utils/date.ts` – Added `getLocalDateISO()`, fixed `getCurrentWeekStartDateISO()` to use it
- `utils/date.ts` – Fixed `hasReachedCourseStartDate()` to parse with `"T00:00:00"` (local midnight)
- `DateSelection.tsx`, `ChakraHome.tsx`, `WelcomeModal.tsx`, `ScrollDatePicker.tsx` – Use `getLocalDateISO()`
- `useChakraJourneyStore.ts` – Use `getLocalDateISO()` for trial endDate
- `TrialTestFlow.tsx` – Use `getLocalDateISO()` (OpeningSequenceTest removed)

### 1.2 hasReachedCourseStartDate Parsing

**Problem:** `new Date("2025-02-03")` parses as **UTC midnight** (ES2015+). Comparison with local `today` caused timezone mismatches.

**Fix:** Use `new Date(courseStartDateISO + "T00:00:00")` so the date is interpreted as local midnight.

### 1.3 RevenueCat Sync on App Start

**Problem:** `hasLifetimeAccess` lives in the journey store (persisted). If the store is cleared or the user reinstalls, they could lose access even though RevenueCat still has the entitlement.

**Fix:** After RevenueCat initializes, call `hasActiveEntitlement()` and, if true, `grantLifetimeAccess("paid")` so the store stays in sync with the source of truth.

---

## 2. Time-Related Systems (Verified)

### 2.1 Day of Week

- **`getCurrentDayOfWeek()`** – Uses `new Date().getDay()` (local). Correct.
- **ChakraHome `currentDay`** – Synced from `realDayOfWeek` via `useEffect`. Correct.

### 2.2 Week Boundaries

- **`getStartOfWeek()`** – Uses `getDay()`, `getDate()`, `setHours(0,0,0,0)` (all local). Correct.
- **`getCurrentWeekStartDateISO()`** – Now uses `getLocalDateISO(monday)` instead of `toISOString()`. Fixed.

### 2.3 Course Start Date

- **`calculateCourseStartDate()`** – Uses `new Date(initialOpenDateISO + "T00:00:00")` (local). Correct.
- **`hasReachedCourseStartDate()`** – Now uses `"T00:00:00"` for parsing. Fixed.

### 2.4 Countdown / Time Remaining

- **`getTimeRemaining()`** – Uses `targetDate.getTime() - now.getTime()`. Timestamps are timezone-agnostic. Correct.
- **GoodbyeModal midnight countdown** – Uses `getTimeRemaining(tomorrow)` where tomorrow is local midnight. Correct.

### 2.5 Journey Notifications

- **`journeyNotifications.ts`** – Uses `new Date(courseStartDateISO + "T00:00:00")` and `setHours()` for local scheduling. Correct.

### 2.6 Scholarship Expiry

- **`scholarshipExpiryDate`** – Stored as `toISOString()` (full timestamp). Comparison with `new Date()` is correct.
- **Check interval** – Every 5 minutes in root layout. Correct.

---

## 3. Timezone Travel Behavior

### 3.1 Current Design

All time logic uses the **device's current local timezone**. When the user travels:

- **Phone auto-updates timezone** – iOS/Android update the system timezone when the user moves.
- **`new Date()`** – Reflects the new timezone immediately.
- **Day of week** – Can change (e.g., Monday evening NYC → Tuesday morning Tokyo).
- **Week boundaries** – `getCurrentWeekStartDateISO()` uses the new local week.

### 3.2 Possible Edge Cases

| Scenario                                                            | Behavior                                                                                                                                               | Risk         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| User starts journey Monday in NYC, flies to Tokyo Tuesday           | In Tokyo, `currentDay` = Tuesday. `journeyWeekStartDate` = "2025-02-03" (Monday). Week comparison: Tokyo's Monday = "2025-02-03". Same week. No reset. | Low          |
| User starts journey Monday in Tokyo, flies to NYC Sunday            | In NYC, it's still Sunday of the same week. No reset.                                                                                                  | Low          |
| User starts Monday Tokyo, flies to NYC (same calendar day, earlier) | In NYC it could be Sunday. `getCurrentWeekStartDateISO()` = previous week's Monday. `journeyWeekStartDate` ≠ current week → **reset**.                 | Medium       |
| User manually changes phone timezone                                | Same as travel – app uses device time.                                                                                                                 | User-induced |

### 3.3 Recommendation

**No automatic "update timezone" prompt.** The app follows the device clock. If the user travels, behavior is consistent with their new location. If they manipulate the clock, that's user choice.

**Optional future enhancement:** Detect large timezone jumps (e.g., >12 hours) and show a brief message: "Your journey follows your device's local time. If you've traveled, your current day may have changed."

---

## 4. Payment Status Sync

### 4.1 Sources of Truth

- **RevenueCat** – For paid purchases (App Store / Play Store).
- **Journey store** – For scholarship (`grantLifetimeAccess("scholarship")`).

### 4.2 Sync Flow

1. **App start** – `initializeRevenueCat()` runs. After init, we call `hasActiveEntitlement()` and sync to the store.
2. **Purchase** – `useRevenueCat.purchase()` calls `grantLifetimeAccess("paid")` on success.
3. **Restore** – `useRevenueCat.restore()` calls `grantLifetimeAccess("paid")` if entitlement exists.
4. **Deep link** – Stripe payment-success calls `grantLifetimeAccess("paid")` after verification.

### 4.3 Store Persistence

- `hasLifetimeAccess`, `paymentStatus`, `scholarshipExpiryDate` are persisted via Zustand + AsyncStorage.
- On reinstall, store is empty. RevenueCat sync on init restores paid status.
- Scholarship is not in RevenueCat; it's store-only. Reinstall loses scholarship status (by design unless we add server-side verification).

---

## 5. Potential Reset / Glitch Scenarios

### 5.1 useChakraWeekTransition

- **Trigger:** `journeyWeekStartDate !== getCurrentWeekStartDateISO()`.
- **Action:** `resetJourney()` – clears weekly progress, keeps `completedTrialCourses`, `hasLifetimeAccess`, `trialHistory`.
- **Risk:** Timezone travel can change the "current week" and trigger a reset. Now that we use local dates consistently, this should be rare and only when the user actually crosses into a new calendar week in their new timezone.

### 5.2 Store Rehydration

- **Risk:** AsyncStorage can be slow. If the app renders before rehydration, we might briefly show the wrong screen.
- **Mitigation:** `useStoreRehydration` gates rendering until `journeyRehydrated` and `firstLaunchRehydrated` are ready.

### 5.3 Clock Manipulation

- **User sets phone date backward** – Could make "today" earlier than course start, or make a new week look like an old one.
- **User sets phone date forward** – Could skip days or trigger week reset.
- **Mitigation:** We trust the device. No server-side time validation. Document that the journey follows device time.

---

## 6. Android / iOS Specifics

### 6.1 Date APIs

- `Date`, `getDay()`, `getFullYear()`, etc. – Same behavior on both platforms.
- `toLocaleDateString()` – Uses system locale; both platforms support it.

### 6.2 Notifications

- **expo-notifications** – Uses local time for scheduling. `setHours()` on a Date is local. Correct.

### 6.3 RevenueCat

- **iOS** – StoreKit 2.
- **Android** – Google Play Billing. Both use RevenueCat's unified API.

---

## 7. Summary

| Area                 | Status     | Notes                               |
| -------------------- | ---------- | ----------------------------------- |
| Local vs UTC dates   | Fixed      | `getLocalDateISO()` used everywhere |
| Week start date      | Fixed      | No longer uses `toISOString()`      |
| Course start parsing | Fixed      | `"T00:00:00"` for local midnight    |
| RevenueCat sync      | Fixed      | Sync to store after init            |
| Timezone travel      | Documented | Follows device; no prompt           |
| Payment status       | Verified   | Multiple sync points                |
| Android/iOS          | Verified   | No platform-specific date bugs      |
