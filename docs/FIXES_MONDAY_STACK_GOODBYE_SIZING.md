# Fixes: Monday → Trials Home, Lifetime Stack, Goodbye iOS, Sizing

**Bundle / dev banners:** The codebase has dev-only banners on ChakraHub (green “CHAKRAHUB UPDATED — bundle loaded”) and GoodbyeModal (magenta “GOODBYE UPDATED — bundle loaded”) when `__DEV__` and iOS. If you **do not see** either banner after a reload, the app is almost certainly **not loading the updated JS bundle** (Metro/cache/device). Use the nuclear clean + Metro `--clear` + `expo run:ios --no-bundler` flow from `docs/IOS_CHAKRAHUB_GOODBYE_BUNDLE_REPORT.md` so the app runs the latest code.

**Locked layouts restored:** Lifetime ChakraHub stack and Goodbye iOS layout were reverted to the **locked production** versions (iOS lifetime hub uses `LIFETIME_HUB_STACK_RAISE_IOS` and `ROOT_BOTTOM_OFFSET_LIFETIME_HUB_IOS`; Goodbye iOS keeps `paddingBottom: 24 + 320` reserve). Opening splash delays were increased so the native splash does not disappear too fast.

---

## 1. Monday in Date Selection → Trials Home (not waiting room)

**Issue:** Opening the app on Monday from Date Selection and tapping "Begin Your Journey" still went to the waiting room instead of directly to the trials home (course opening).

**Root cause:** If the user had no `courseStartDate` set, or had selected a *future* Monday, tapping Begin navigated to ChakraHome which then showed the waiting room because `hasReachedStartDate` was false.

**Fix (DateSelection.tsx):**
- When **today is Monday** and the user taps "Begin Your Journey":
  - If there is **no** `courseStartDate`, set `courseStartDate` and `initialOpenDate` to **today** so they go straight to trials home.
  - If `courseStartDate` is set but **not yet reached** (e.g. next week), set both to **today** so they go straight to trials home.
- Uses `getLocalDateISO()` and `hasReachedCourseStartDate()` from `@/utils/date`; `isMondayToday` is derived from the date (day === 1).

**Result:** On Monday, tapping Begin from Date Selection always leads to the trials home (chakra stack), not the waiting room.

---

## 2. Match Lifetime ChakraHub Stack to Trials Home Stack

**Issue:** Lifetime home chakra stack placement should match the trials home stack (trials home placement is the reference).

**Fix:**
- **IntegratedProgressStack.tsx:** Removed iOS-only lifetime hub overrides (`ROOT_BOTTOM_OFFSET_LIFETIME_HUB_IOS`, `LIFETIME_HUB_STACK_RAISE_IOS`). Both trial home and lifetime hub now use the same layout:
  - `bottomPadding` = `TRIAL_HOME_ROOT_CHAKRA.BOTTOM_PADDING`
  - `viewportHeight` = `viewportHeightForTrialHome` (same scroll padding formula)
  - `stackContainerHeight` = `viewportHeight` (no subtraction for lifetime).
- **ChakraHub.tsx:** Stack block height now uses the **same** viewport formula as trials home: `windowHeight - insets.top - insets.bottom - scrollPaddingTop - scrollPaddingBottom` (with `TRIAL_HOME_ROOT_CHAKRA` and `SCROLL_BREATHING_BOTTOM_PADDING`). Removed `LIFETIME_HUB_STACK_RAISE_IOS`.

**Result:** Lifetime hub chakra stack position and height match the trials home stack.

---

## 3. iOS Goodbye: In-Flow Layout (not overlay lower section)

**Issue:** On iOS, goodbye still appeared as an overlay with the lower section feeling separate; layout/sizing was off.

**Fixes (GoodbyeModal.tsx):**
- **iOS bottom section:** The bottom section (gift card, Open Your Gift, Home) already used `bottomSectionInFlow` on iOS (position relative so it’s in-flow in the column). Confirmed and left as-is.
- **Column wrapper:** Added `minHeight: 0` to the main column `View` so flex layout doesn’t overflow.
- **ScrollView reserve:** On iOS, removed the large bottom reserve (`paddingBottom: 24 + 320`). With the bottom section in-flow, only `paddingBottom: 24` and `flexGrow: 0` are used so the page doesn’t feel oversized.
- **Comment:** Updated to state that both Android and iOS use in-flow column layout for the bottom section.

**Result:** Goodbye on iOS is one continuous page (scroll + bottom section in one column), with no excessive empty space.

---

## 4. Wrappers / Safe Area / Sizing Audit

**ChakraHub:**
- Uses `SafeAreaView` with `edges={["left", "right"]}` (top/bottom not inset by SafeAreaView). Stack block height is computed with `insets.top` and `insets.bottom`, so the stack fits within the safe area. ActionBar and content above the stack start at the top of the screen.
- If the screen still “feels large,” check for any extra padding or full-height wrappers; stack height is now aligned with trials home.

**GoodbyeModal:**
- Full-screen overlay (absolute); content uses `topInset` and `bottomInset` from `useSafeAreaInsets()`. Column has `flex: 1` and `minHeight: 0`; ScrollView has `flex: 1, minHeight: 0` and reduced bottom padding so layout is constrained.

**General:** If either page still feels too large on a given device, verify:
- No double application of safe area (e.g. SafeAreaView + manual insets in the same direction).
- No unnecessary `flex: 1` or `minHeight` that forces expansion.
- `maxWidth: 420` and centering on Goodbye are unchanged for readability.
