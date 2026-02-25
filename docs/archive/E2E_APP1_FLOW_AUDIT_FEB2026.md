# App 1 E2E Flow Audit – February 2026

## Scope

Comprehensive E2E check of Trial 1, Trial 2, post-paywall, and lifetime access flows after pre-launch updates (scholarship audit, purchase/restore UI, rehydration, safe storage, course mode persist).

---

## 1. Flow Summary

```
Splash → index.tsx (rehydration) → ALWAYS WelcomeScreen (no bypass)

WelcomeScreen → Enter Path → DateSelection (trial) | ChakraHub (lifetime)
DateSelection → Begin → ChakraHome
ChakraHome → WaitingScreen (until Monday) | Trial days 0–6 | CommitmentGate (paywall)
CommitmentGate → Purchase | Scholarship | Restore → AccessGrantedModal → ChakraHub/ChakraHome
```

**Do not bypass:** `hasCompletedHeroOnboarding`, `courseStartDate`, or any flag must NEVER skip WelcomeScreen.

---

## 2. Trial 1 Flow

| Step | Location                         | State / Action                                                                                    |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1    | index.tsx                        | Rehydration ready; ALWAYS → WelcomeScreen                                                         |
| 2    | WelcomeScreen                    | Enter Path → DateSelection                                                                        |
| 3    | DateSelection                    | Select date → Confirm → Begin                                                                     |
| 4    | DateSelection handleBeginJourney | setHasCompletedHeroOnboarding(true), setFirstLaunchComplete(), router.replace ChakraHome          |
| 5    | ChakraHome                       | courseStartDate set; WaitingScreen if !hasReachedStartDate or !isMonday                           |
| 6    | WaitingScreen                    | Monday: Begin Again → startJourney(currentWeekStartDate)                                          |
| 7    | ChakraHome                       | Days 0–6 accessible; markChakraCompleted, checkAndSetCompletion                                   |
| 8    | Sunday (day 7)                   | All 7 complete → completeTrialCourse: completedTrialCourses = 1, trialHistory[0].completed = true |

---

## 3. Trial 2 Flow

| Step | Location       | State / Action                                                                        |
| ---- | -------------- | ------------------------------------------------------------------------------------- |
| 1    | Monday         | useChakraWeekTransition: week changed → resetJourney()                                |
| 2    | resetJourney   | wasCompleted; alreadyCounted (trialHistory[0].completed) → no increment (fix applied) |
| 3    | ChakraHome     | WaitingScreen; Begin Again → startJourney → trialHistory gets Trial 2                 |
| 4    | ChakraHome     | currentTrialNumber = 2; days 0–6 accessible                                           |
| 5    | Sunday (day 7) | All 7 complete → completeTrialCourse: completedTrialCourses = 2                       |

---

## 4. Post-Trial (2 Completed) Flow

| Step | Location      | State / Action                                                                                                                 |
| ---- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | index.tsx     | ALWAYS → WelcomeScreen; user taps Enter Path → DateSelection                                                                   |
| 2    | DateSelection | handleBeginJourney: completedTrialCourses >= 2 and !hasLifetimeAccess → does not set hasCompletedHeroOnboarding (already true) |
| 3    | ChakraHome    | shouldShowCommitmentGate: isSecondTrialEnded (currentTrialNumber === 2) → true                                                 |
| 4    | ChakraHome    | setShowPaymentGate(true) → CommitmentGate                                                                                      |

---

## 5. Lifetime Access Paths

| Path            | Flow                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Purchase**    | purchase(PRODUCT_IDS.YEARLY) → grantLifetimeAccess("paid") → AccessGrantedModal                                             |
| **Scholarship** | ScholarshipModal reason → logScholarshipRequest (fire-and-forget) → grantLifetimeAccess("scholarship") → AccessGrantedModal |
| **Restore**     | restore() → hasEntitlement? AccessGrantedModal : restoreError                                                               |

---

## 6. Recent Changes – Conflict Check

| Change              | Impact on Flow                                 | Status        |
| ------------------- | ---------------------------------------------- | ------------- |
| Scholarship audit   | Fire-and-forget log; no blocking               | OK            |
| Purchase error UI   | CommitmentGate only; errors shown              | OK            |
| Restore + error UI  | CommitmentGate; entitlement check before modal | OK            |
| Rehydration loading | index.tsx; blocks until ready                  | OK            |
| Safe storage        | Corrupted JSON → clear key, default state      | OK (no crash) |
| Course mode persist | lifetimeChosenTimegateJourney persisted        | OK            |
| resetJourney fix    | Prevents double increment after Trial 1        | Fixed         |

---

## 7. Bug Fixed

**Double increment of completedTrialCourses**

- **Before:** completeTrialCourse (day 7) set completedTrialCourses = 1; resetJourney (Monday) incremented again → 2. Paywall after Trial 1.
- **After:** resetJourney checks trialHistory[currentTrialIndex].completed; if true, skips increment.
- **File:** `hooks/useChakraJourneyStore.ts` (resetJourney)

---

## 8. State Dependencies

| Screen         | Key State                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| index.tsx      | storeRehydrationReady (ALWAYS routes to WelcomeScreen; no bypass)                                       |
| WelcomeScreen  | hasLifetimeAccess                                                                                       |
| DateSelection  | completedTrialCourses, hasLifetimeAccess, courseStartDate                                               |
| ChakraHome     | journeyStarted, completedTrialCourses, allChakrasCompleted, currentDay, trialHistory, hasLifetimeAccess |
| CommitmentGate | purchase, restore, grantLifetimeAccess                                                                  |

---

## 9. Edge Cases

| Case                      | Handling                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| Corrupted storage         | safeAsyncStorage clears key; default state; user restarts as new |
| RevenueCat disabled (dev) | Purchase/restore fail; error UI shown                            |
| Restore with no purchases | restoreError; no AccessGrantedModal                              |
| Purchase cancelled        | purchaseError cleared                                            |
| Rehydration timeout       | safetyPassed after 2.5s; app proceeds                            |

---

## 10. Files Touched in Audit

- `hooks/useChakraJourneyStore.ts` – resetJourney fix
- `app/(chakras)/index.tsx` – routing
- `app/(chakras)/WelcomeScreen.tsx` – Enter Path
- `app/(chakras)/DateSelection.tsx` – Begin
- `components/chakras/ChakraHome.tsx` – trial home, paywall
- `components/chakras/CommitmentGate.tsx` – purchase, scholarship, restore
- `hooks/useChakraWeekTransition.ts` – week rollover
