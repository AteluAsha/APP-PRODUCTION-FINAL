## Phase 1: Scope and Environment

1a. **Define test environments** ✅ (code + process ready)

- Use latest dev build + latest production-like (EAS preview) when ready
- Verify clean install (no cached AsyncStorage) for trial hero flow
- Goal: Ensure trial (App1) is the default first-run flow

**Implementation Notes:**

- Use device uninstall/reinstall for true clean state
- Confirm `hasLifetimeAccess` is false on first launch

## Phase 2: App1 (Trial) Flow

2a. **Onboarding and path selection** ⚠️ (device verification)

- Welcome → Enter Path → DateSelection → ChakraHome (Waiting)
- Ensure Welcome modal + first launch logic show only once
- Goal: Trial is the hero experience on clean install

**Implementation Notes:**

- Verify `first-launch-storage` and `chakra-journey-storage` defaults
- Dev builds now force trial hero (RootLayout dev reset)

2b. **Waiting room and timegates** ⚠️ (device verification)

- Waiting screen until course start date (Monday) then day unlocks
- Verify `isChakraDayAccessible` logic in `timegate.ts`
- Goal: Only current day unlocks unless participated

**Implementation Notes:**

- Confirm `__DEV__` bypass only applies in dev builds
- Confirm trial hero on clean install (no AsyncStorage carryover)

2c. **Daily chakra experience** ⚠️ (device verification)

- Back navigation returns to ChakraHome
- Goodbye modal shows for completed days
- Goal: No loops; modal closes cleanly

2d. **Trial paywall and upgrade** ⚠️ (RevenueCat disabled)

- CommitmentGate appears after trial completion
- PaymentGate shows appropriate copy/links
- Goal: Trial → upgrade path is consistent

**Implementation Notes:**

- `initializeRevenueCat` still returns early (must remove for E2E)

## Phase 3: App2 (Lifetime) Flow

3a. **ChakraHub entry + navigation** ✅ (code verified)

- Welcome → Enter Path → ChakraHub
- Back arrow defaults to ChakraHub when goodbye modal visible
- Goal: No navigation loops in lifetime flow

3b. **Goodbye screens (all 7 days)** ✅ (code verified)

- Chakra icon → ChakraHub (home)
- X close → ChakraHub
- Home text → ChakraHub
- Gallery back → ChakraHub
- Goal: Always default to home in lifetime

**Implementation Notes:**

- Lifetime goodbye flow now defaults to ChakraHub on all exits

3c. **Somatic journey (optional)** ⚠️ (device verification)

- ChakraHub → DateSelection → ChakraHome (timegated flow)
- Exit course mode → ChakraHub
- Goal: Timegates apply only when user chose somatic journey

## Phase 4: Audio Playback + Caching

4a. **Short audio (tuning fork, intro/outro)** ⚠️ (device verification)

- Playback starts immediately
- No stutter on start
- Goal: Smooth playback everywhere

4b. **Long audio (crystal bowls, embodiment)** ⚠️ (device verification)

- Full download required for crystal bowls (no streaming fallback)
- Head cache for long embodiment audio
- Goal: No streaming glitches on iOS

**Implementation Notes:**

- Crystal bowl playback now forces full download before play

## Phase 5: Social + Community

5a. **Community Halls** ⚠️ (device verification)

- Access from App2 menu
- Back returns to ChakraHub
- Goal: Navigation stack intact

5b. **Anua Chat** ⚠️ (device verification)

- Open/close without navigation conflicts
- No blocking overlays after close
- Goal: Return to prior screen cleanly

## Phase 6: Payments + Entitlements

6a. **RevenueCat initialization** ❌ (blocked: early return)

- Remove early `return` in `src/services/revenuecat.ts`
- Confirm API key + entitlement config
- Goal: Purchase + restore works

**Implementation Notes:**

- Blocker: early return currently disables RevenueCat

6b. **Entitlement gating** ✅ (code verified)

- Trial users cannot access App2 routes
- Lifetime users can access all
- Goal: No cross-mode leaks

## Phase 7: Content + Assets

7a. **Chakra content completeness** ⚠️ (audio placeholders)

- Ensure each day’s text/affirmation/media renders
- Confirm audio placeholder usage is intentional or replaced
- Goal: No missing assets or placeholder leakage

**Implementation Notes:**

- Outro placeholders still shared across chakras

7b. **Media density** ⚠️ (device verification)

- Validate images + fonts on iOS/Android
- Goal: No pixelation or broken paths

## Phase 8: UX Consistency

8a. **Back navigation** ✅ (code verified)

- Back arrows on key screens go to correct home for mode
- Goal: No loops or dead ends

8b. **Global home icon** ✅ (code verified)

- On lifetime goodbye flows, always returns to ChakraHub
- Goal: fail-safe navigation

## Phase 9: Execution Notes (E2E Pass)

9a. **Current pass status**

- Code paths reviewed and annotated where possible
- Device/simulator validation still required for items marked ⚠️
- RevenueCat remains blocked until early return is removed

9b. **Required device checks (run on iOS + Android)**

- Trial hero flow: Welcome → DateSelection → ChakraHome (waiting) → day unlock
- Lifetime flow: Welcome → ChakraHub → all 7 goodbyes exit to ChakraHub
- Audio: short (tuning fork), long (crystal bowls full download, embodiment head)
- Community + Anua: open/close, back navigation integrity
- Gallery: open from goodbye; back returns to ChakraHub (lifetime)

