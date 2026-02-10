# Core Flow Validation System

## Purpose
This document defines the core flow validation system for all changes to the app. **Every change must be validated against this core flow** to ensure consistency between Trials and Post-Paywall experiences.

## Core Flow Structure

### 1. TRIALS (Trial 1 & Trial 2)
**HomeScreen 1: `ChakraHome.tsx`**

**Key Characteristics:**
- Progressive chakra reveal (one per day, Monday-Sunday)
- Timegate logic active (chakras unlock day by day)
- `hasLifetimeAccess === false`
- Shows `WaitingScreen` before journey starts
- Shows `WelcomeModal` for new users
- Shows `CommitmentGate` (paywall) after Trial 2

**Navigation:**
- Floating buttons: Leaf (left, top) → Notes; Anua (bottom-right) → Social Sanctuary
- NO menu bar
- Gallery button visible (if cards unlocked)
- "Learn About Chakras" button visible
- NO "Hub" button (ChakraHub is post-paywall only)

**Features:**
- Day-by-day chakra unlocking
- Notes along the way (JourneyNotesView)
- Anua chat (context-aware for current day)
- Social Sanctuary (limited to current day)
- Gallery of Gnosis (unlocked cards)
- Goodbye modal → Returns to ChakraHome with next-day tease

**End of Trial Flow:**
- Trial 1 ends → Option to begin Trial 2 (if not all 7 days completed) OR paywall (if all 7 days completed)
- Trial 2 ends → Paywall (`CommitmentGate`)

---

### 2. POST-PAYWALL (Lifetime Access)
**HomeScreen 2: `ChakraHub.tsx`**

**Key Characteristics:**
- All chakras always accessible
- Timegate logic bypassed (`hasLifetimeAccess === true`)
- NO waiting screens
- NO welcome modals
- NO paywall

**Navigation:**
- Floating buttons: Leaf (above menu bar, left) → Notes; Anua (above menu bar, right) → Social Sanctuary
- Menu bar visible at bottom: Home, Music, Community, Gallery
- Chakra color wheel (top left) → Returns to ChakraHub
- Music icon (top right) → SoundBath (all audio available)

**Features:**
- All chakras accessible anytime
- Notes along the way (JourneyNotesView)
- Anua chat (full "starseed mode" - full wisdom)
- Social Sanctuary (all days accessible, full features)
- Gallery of Gnosis (all cards)
- SoundBath (all 1-hour crystal bowls + all meditations)
- Community Halls (full features)
- Goodbye modal → Returns to ChakraHub

---

## Validation Checklist

When making any change, verify:

### ✅ Trials vs Post-Paywall Separation
- [ ] Is this feature available in Trials? (check `hasLifetimeAccess`)
- [ ] Is this feature available in Post-Paywall? (check `hasLifetimeAccess`)
- [ ] Are navigation elements correctly conditional? (menu bar, floating buttons, etc.)
- [ ] Are screens correctly routed? (ChakraHome for trials, ChakraHub for post-paywall)

### ✅ Timegate Logic
- [ ] Does this change respect timegate logic for trials?
- [ ] Does this change bypass timegate for post-paywall?
- [ ] Are chakras unlocked progressively in trials? (one per day)
- [ ] Are all chakras accessible in post-paywall?

### ✅ Navigation Flow
- [ ] Are floating buttons positioned correctly? (trials vs post-paywall)
- [ ] Is menu bar only visible post-paywall?
- [ ] Do buttons open correct modals/screens?
- [ ] Is back navigation correct? (Goodbye modal → correct home screen)

### ✅ Anua Integration
- [ ] Does Anua chat respect current day context in trials?
- [ ] Does Anua chat have full wisdom in post-paywall?
- [ ] Are Anua buttons consistent globally? (always open SocialSanctuaryModal)
- [ ] Does Anua work in waiting room? (teases journey)

### ✅ Audio Playback
- [ ] Are only clicked audios loaded in trials?
- [ ] Are all audios available in post-paywall?
- [ ] Does audio stop when navigating away?
- [ ] Are first 6 embodiment meditations working? (including Day 6 two-part)

### ✅ Visual Consistency
- [ ] Are earth tones used for paywall? (`CommitmentGate.tsx`)
- [ ] Are colors consistent across trial/post-paywall screens?
- [ ] Are buttons styled consistently?
- [ ] Are modals styled consistently?

---

## Code Patterns to Follow

### Checking Trial vs Post-Paywall
```typescript
const hasLifetimeAccess = useChakraJourneyStore(
  useShallow((state) => state.hasLifetimeAccess)
)

// Trial-specific code
if (!hasLifetimeAccess) {
  // Trial logic
}

// Post-paywall-specific code
if (hasLifetimeAccess) {
  // Post-paywall logic
}
```

### Conditional Rendering
```typescript
{/* Trial-only: Gallery button */}
{!hasLifetimeAccess && (
  <Pressable onPress={handleGalleryPress}>
    {/* Gallery button */}
  </Pressable>
)}

{/* Post-paywall-only: Hub button */}
{hasLifetimeAccess && (
  <Pressable onPress={() => router.push('/(chakras)/ChakraHub')}>
    {/* Hub button */}
  </Pressable>
)}
```

### Navigation Routing
```typescript
// Goodbye modal - correct routing
const handleHomePress = () => {
  if (hasLifetimeAccess) {
    router.push('/(chakras)/ChakraHub') // Post-paywall
  } else {
    router.push('/(chakras)') // Trials (ChakraHome)
  }
}
```

---

## Files to Check for Core Flow Compliance

### Critical Files (Always Validate Changes)
- `components/chakras/ChakraHome.tsx` - Trial home screen
- `app/(chakras)/ChakraHub.tsx` - Post-paywall home screen
- `components/navigation/FloatingNavButtons.tsx` - Global floating buttons
- `components/navigation/PermanentMenuBar.tsx` - Post-paywall menu bar
- `components/chakras/GoodbyeModal.tsx` - End of day modal
- `hooks/useChakraJourneyStore.ts` - Journey state management
- `src/services/timegate.ts` - Timegate logic

### Related Files (Check When Modified)
- `components/chakras/WaitingScreen.tsx` - Trial waiting room
- `components/chakras/WelcomeModal.tsx` - Trial welcome
- `components/chakras/CommitmentGate.tsx` - Paywall
- `components/social/SocialSanctuaryModal.tsx` - Social features
- `components/anua/AnuaChatModal.tsx` - Anua chat
- `app/_layout.tsx` - Global layout (floating buttons, menu bar)

---

## Testing Checklist

Before committing any change:

1. **Trial Flow Test**
   - [ ] New user → Welcome → Date selection → Waiting room
   - [ ] Waiting room → Journey starts on Monday
   - [ ] Day 1-7: Chakras unlock progressively
   - [ ] Goodbye modal → Returns to ChakraHome with next-day tease
   - [ ] Trial 1 ends → Option for Trial 2 or paywall
   - [ ] Trial 2 ends → Paywall

2. **Post-Paywall Flow Test**
   - [ ] After payment → ChakraHub opens
   - [ ] All chakras accessible
   - [ ] Menu bar visible
   - [ ] Floating buttons above menu bar
   - [ ] Goodbye modal → Returns to ChakraHub
   - [ ] All features accessible (Music, Community, Gallery)

3. **Audio Test**
   - [ ] Audio stops when navigating away
   - [ ] Only clicked audios load in trials
   - [ ] All audios available in post-paywall
   - [ ] First 6 embodiment meditations work (including Day 6 two-part)

4. **Navigation Test**
   - [ ] Floating buttons positioned correctly (trials vs post-paywall)
   - [ ] Menu bar only visible post-paywall
   - [ ] All buttons route correctly
   - [ ] Back navigation works correctly

---

## Change Validation Process

1. **Before Making Changes**
   - Review this document
   - Identify which flow(s) are affected (Trials, Post-Paywall, or both)
   - Plan changes to respect core flow separation

2. **During Changes**
   - Add conditional logic based on `hasLifetimeAccess`
   - Check navigation routing
   - Verify timegate logic
   - Test affected flows

3. **After Changes**
   - Run validation checklist
   - Test both Trial and Post-Paywall flows
   - Verify no regressions
   - Update this document if core flow changes

---

## Notes

- **Always check `hasLifetimeAccess`** before adding trial-only or post-paywall-only features
- **Never mix trial and post-paywall logic** without proper conditionals
- **Test both flows** after any change
- **Keep navigation consistent** (ChakraHome for trials, ChakraHub for post-paywall)
- **Respect timegate logic** (progressive unlock for trials, bypass for post-paywall)
