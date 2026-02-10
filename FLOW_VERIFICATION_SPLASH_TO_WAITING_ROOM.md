# Flow verification: iOS splash → welcome → date selection (locked) → confirmation → waiting room

**Verified:** Code path only (no device run). All of the following are wired and match the intended “working perfectly” flow.

---

## 1. iOS opens to splash screen (original)

**Root layout (`app/_layout.tsx`):**
- `SplashScreen.preventAutoHideAsync()` runs at load.
- Initial state: `showHeroLogo === true`.
- First paint: `if (showHeroLogo) return <SplashScreenReveal ... />` → user sees the **hero logo splash** (Soul School logo), not the main app.
- **SplashScreenReveal** (`components/SplashScreenReveal.tsx`): fade-in, scale, breathing animation, then after a minimum display time (2s) + fade-out it calls `onAnimationComplete` → root sets `setShowHeroLogo(false)`.
- Then the main app (Stack + chakras) is shown with `FadeIn.duration(1000)`.

**Conclusion:** iOS opens to the original in-app splash (hero logo). No SafeAreaProvider at root (no double provider). Flow is: native splash (Expo/iOS) → hero splash (SplashScreenReveal) → main app.

---

## 2. Right to correct welcome screen

**Entry:**
- `app/(chakras)/index.tsx` renders **`<ChakraHome />`** only (restored).
- So after splash, the first screen is **ChakraHome**.

**Welcome = WelcomeModal on first launch:**
- In **ChakraHome** (`components/chakras/ChakraHome.tsx`):
  - `isFirstLaunch` from `useFirstLaunchStore()`.
  - `useEffect(() => { if (isFirstLaunch) setShowWelcomeModal(true) }, [isFirstLaunch])`.
- So on first launch, **WelcomeModal** is shown as the “welcome” experience (hero logo, “Your Path Awaits”, date selection, Begin button).

**Conclusion:** After splash, the user goes straight to the correct welcome: ChakraHome with WelcomeModal open (no placeholder screen, no separate WelcomeScreen route as first screen).

---

## 3. Properly locked design of date selection

**Inside WelcomeModal (`components/chakras/WelcomeModal.tsx`):**
- **ScrollDatePicker** for Monday selection.
- On date select: `handleDateSelect(dateISO)` → `setSelectedDateISO(dateISO)` and **`setShowConfirmation(true)`**.
- **DateConfirmationModal** is rendered with `visible={showConfirmation}`, `onConfirm={handleConfirmDate}`, `onCancel={handleCancelConfirmation}`.
- **handleConfirmDate:**  
  - Sets `initialOpenDate` to today.  
  - Sets **`setCourseStartDate(selectedDateISO)`** (locks the chosen Monday).  
  - `setShowConfirmation(false)`.

So the flow is: pick Monday → **confirmation popup** → confirm → **date is locked** (courseStartDate set). That is the “properly locked design” of date selection with a confirmation step.

---

## 4. Pop-up confirmation to begin path

- **DateConfirmationModal** is the pop-up that appears after they pick a date; confirming there locks the date (above).
- **“Begin Your Journey”** is the footer button in WelcomeModal; it calls **`onBeginJourney`** (ChakraHome’s `handleBeginJourney`).

So: **date selection → confirmation pop-up (lock date) → user taps “Begin Your Journey”** = pop-up confirmation then begin path. Both are present and wired.

---

## 5. To waiting room

**When user taps “Begin Your Journey”:**
- **ChakraHome.handleBeginJourney** runs:
  - `setShowWelcomeModal(false)`
  - `setFirstLaunchComplete()`
- Modal closes; ChakraHome re-renders with `isFirstLaunch === false` and `courseStartDate` set (from WelcomeModal’s handleConfirmDate).

**Waiting screen logic in ChakraHome:**
- A single `useEffect` computes `showWaiting = shouldShowWaitingScreenCheck(hasLifetimeAccess, hasReachedStartDate, isMonday, journeyStarted, isFirstLaunch, courseStartDate, lifetimeChosenTimegateJourney)` and then **`setShowWaitingScreen(showWaiting)`**.
- For trial users who just chose a **future** Monday: `hasReachedStartDate === false` → **shouldShowTrialWaitingScreen** returns **true** → `showWaitingScreen === true`.
- ChakraHome then renders: `if (showWaitingScreen) return <WaitingScreen ... />`.

So after “Begin Your Journey”, the user is taken to the **WaitingScreen** (waiting room) until the chosen Monday.

---

## 6. Summary table

| Step | Expected | Status in code |
|------|----------|----------------|
| iOS opens to splash | Hero logo splash first | ✅ Root shows SplashScreenReveal first; then main app |
| Original splash | Soul School hero logo, then transition | ✅ SplashScreenReveal with logo, animation, onAnimationComplete |
| Correct welcome screen | ChakraHome with welcome UX (not placeholder) | ✅ index = ChakraHome; first launch shows WelcomeModal |
| Date selection | Locked design (pick Monday, then confirm) | ✅ ScrollDatePicker → DateConfirmationModal → setCourseStartDate |
| Pop-up confirmation | Confirm date before locking | ✅ DateConfirmationModal visible on date select; onConfirm locks |
| Begin path | Button to leave welcome and “begin” | ✅ “Begin Your Journey” calls onBeginJourney |
| To waiting room | After begin, show waiting until Monday | ✅ handleBeginJourney + setFirstLaunchComplete; useEffect sets showWaitingScreen; WaitingScreen rendered |

---

## 7. Journey reminders (aligned with DateSelection)

- **WelcomeModal** now calls **`scheduleJourneyReminders(selectedDateISO)`** in `handleConfirmDate` after `setCourseStartDate(selectedDateISO)`, so the welcome path matches the DateSelection screen and reminders are scheduled when the user confirms their start date in the modal.

---

**Bottom line:** The flow from iOS splash → original hero splash → correct welcome (ChakraHome + WelcomeModal) → locked date selection with pop-up confirmation → Begin Your Journey → waiting room is implemented and consistent with the codebase. No missing steps were found for that path.
