# App1 / App2 Audit – February 2026

**Scope:** Verify no conflicts between Trial (App1) and Lifetime (App2) from today’s audio/Music Room changes. Confirm trial screens, timegates, paywall, and post‑trial flows.

---

## Today’s Changes and Impact

| Change                                  | Affects Trial? | Affects Lifetime? | Notes                                                                                                          |
| --------------------------------------- | -------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| MusicRoomAudioManager                   | No             | Yes               | Only runs when `audioOrigin === 'music-room'`. Trial never sets that (no access to Music Room).                |
| MenuBarMiniPlayer                       | No             | Yes               | Rendered inside PermanentMenuBar, which returns `null` when `!hasLifetimeAccess`. Trial never sees it.         |
| AudioLibrary redirect                   | Yes            | No                | `!hasLifetimeAccess` → `router.replace('/(chakras)/ChakraHome')`. Trial cannot reach Music Room.               |
| ChakraTemplate – remove MiniAudioPlayer | Both           | Both              | Both use ChakraTemplate. Old mini player removed; no replacement for trial (trial never had music-room audio). |
| AudioPlayer – reset on unmount          | Both           | Both              | Resets when `audioOrigin === 'other'`. Same behavior for trial and lifetime.                                   |
| Crystal Bowl volume boost               | Both           | Both              | Applied when metadata includes "Crystal Bowl". Same for trial and lifetime.                                    |

**Conclusion:** Today’s changes do not introduce conflicts between App1 and App2.

---

## Trial (App1) Flow

### Entry

1. **index** → WelcomeScreen
2. **WelcomeScreen:** `!hasLifetimeAccess` → `router.push('/(chakras)/DateSelection')`
3. **DateSelection:** Select start date → `router.replace('/(chakras)/ChakraHome')`

### ChakraHome (Trial)

4. **WaitingScreen** until:
   - `hasReachedStartDate` and `isMonday` and `journeyStarted`
   - In `__DEV__`, timegates are bypassed (all days open)
5. **Timegates (production):** `isChakraDayAccessible` – current day + participated/completed days only
6. **Chakra cards** → `[chakra]` (ChakraTemplate)

### Paywall

7. **shouldShowCommitmentGate:**
   - Trial 1 complete (all 7 days) on Sunday
   - Trial 2 on Sunday
8. **CommitmentGate** → purchase or scholarship → `grantLifetimeAccess` → `onComplete` → `setShowPaymentGate(false)`

### Post‑Paywall

9. **hasLifetimeAccess = true**
10. **ChakraHome useEffect:** `hasLifetimeAccess && !lifetimeChosenTimegateJourney` → `router.replace('/(chakras)/ChakraHub')`

---

## Lifetime (App2) Flow

### Entry (after paywall)

1. **ChakraHub** (main screen)
2. **PermanentMenuBar** visible: Music, Community, Gallery, Notes, Anua

### Routing Guards

- **ChakraHub:** `!hasLifetimeAccess` → `router.replace('/(chakras)/ChakraHome')`
- **AudioLibrary:** `!hasLifetimeAccess` → `router.replace('/(chakras)/ChakraHome')`
- **ChakraHome route:** `hasLifetimeAccess && !lifetimeChosenTimegateJourney` → `router.replace('/(chakras)/ChakraHub')` (return null)

### App2 Screens

- Music Room (AudioLibrary)
- Community Halls
- Gallery of Gnosis
- Notes Along the Way
- Chakras101
- Accountability of Awakening
- Donate
- Chakra day pages ([chakra])
- Sound Bath
- Head to Heart

---

## Timegate Checks

| Check                     | Trial                      | Lifetime                       |
| ------------------------- | -------------------------- | ------------------------------ |
| `isChakraDayAccessible`   | Current day + participated | Always true                    |
| `shouldShowWaitingScreen` | Until Monday/start date    | false (except somatic journey) |
| `shouldBypassTimegate`    | No (unless `__DEV__`)      | Yes                            |
| `__DEV__` override        | All timegates bypassed     | All timegates bypassed         |

---

## Audio Behavior by App

| Scenario                    | Trial                  | Lifetime                                                  |
| --------------------------- | ---------------------- | --------------------------------------------------------- |
| Chakra day – intro/outro    | AudioRow → AudioPlayer | Same                                                      |
| Sound Healing (from chakra) | Same                   | Same                                                      |
| Music Room                  | Redirected             | Inline play + mini player                                 |
| Leave AudioPlayer           | Reset (stop)           | Reset (stop)                                              |
| Mini player                 | Never shown            | Shown when Music Room audio playing & not on AudioLibrary |

---

## Navigation Summary

| From                       | To (Trial)            | To (Lifetime)   |
| -------------------------- | --------------------- | --------------- |
| WelcomeScreen              | DateSelection         | ChakraHub       |
| ChakraHome (after paywall) | N/A                   | ChakraHub       |
| ChakraTemplate – Goodbye   | ChakraHome            | ChakraHub       |
| [chakra] – invalid         | ChakraHome            | ChakraHub       |
| SoundBath – invalid chakra | ChakraHome            | ChakraHub       |
| AudioLibrary               | ChakraHome (redirect) | Full Music Room |
| ChakraHub                  | ChakraHome (redirect) | Full access     |

---

## Verification Checklist

- [x] Trial cannot reach Music Room
- [x] Trial never sees MenuBarMiniPlayer
- [x] Trial never triggers MusicRoomAudioManager (no `audioOrigin === 'music-room'`)
- [x] Sound Healing and chakra audio work for both
- [x] AudioPlayer reset on leave works for both
- [x] Paywall → grantLifetimeAccess → redirect to ChakraHub
- [x] ChakraHub redirects trial to ChakraHome
- [x] ChakraHome redirects lifetime to ChakraHub (unless somatic journey)
- [x] Timegates behave as documented (including `__DEV__` bypass)

---

## Note on AccessGrantedModal

When CommitmentGate completes, it calls `onComplete()` (which sets `showPaymentGate(false)`). That unmounts CommitmentGate, including AccessGrantedModal. The celebration modal may only flash before navigation. This is a pre‑existing UX detail, not introduced by today’s changes.
