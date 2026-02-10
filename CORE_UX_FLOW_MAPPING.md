# Core UX Flow Mapping & Restoration Plan

## Current State vs Desired Flow

### ✅ What Exists (Working Well)

1. **Splash Screen** - `SplashScreenReveal` component with hero logo animation
2. **Welcome Modal** - `WelcomeModal` with date selection and confirmation
3. **Waiting Screen** - `WaitingScreen` with countdown and buttons
4. **Progressive Chakra Reveal** - `IntegratedProgressStack` shows chakras one per day
5. **Goodbye Modal** - `GoodbyeModal` with gallery option
6. **Permanent Menu Bar** - `PermanentMenuBar` with Home, Gallery, Sanctuary, Diary
7. **ChakraHub** - Post-paywall landing page with chakra cross pattern
8. **Anua Button** - Multiple implementations exist

### ⚠️ What Needs Adjustment

1. **Trial Buttons** - Need leaf/notes button on left, Anua button on right (currently FloatingNavButtons has both, but needs refinement)
2. **Permanent Menu Bar** - Should ONLY show after paywall, not during trials
3. **Goodbye Modal** - Needs "Home Screen with Chakra Logo" option added
4. **Anua Button** - Should ALWAYS open SocialSanctuaryModal with 3 buttons (Talk to Anua, Social Sanctuary, etc.)
5. **Waiting Screen** - Needs Chakras 101 and Anua buttons confirmed
6. **Audio Section** - Need to verify trial vs full access behavior

---

## Desired Flow Breakdown

### Phase 1: First Launch (Trial Mode)

1. **Splash Screen** → Hero logo animation
2. **Begin Journey Page** → Date selection with confirmation
   - Option to add friend (also on waiting room)
3. **Waiting Room** → Content + 2 buttons:
   - Chakras 101
   - Anua (limited/wisely teaching journey mode)
4. **Monday Opens** → Root chakra home screen
   - ONLY root chakra visible
   - Leaf/notes button (left) → Notes along the way
   - Anua button (right) → Social Sanctuary Modal (3 buttons)
5. **Daily Progression**:
   - Day 2: Root + Sacral
   - Day 3: Root + Sacral + Solar Plexus
   - ... etc
   - Always starting with Root at bottom
6. **Finish Day** → Goodbye Modal
   - Gallery option
   - **NEW:** Home screen with chakra logo (returns to progressive reveal, shows next day tease)

### Phase 2: After Trial 1

- **Completed All 7 Days** → Paywall option
- **Didn't Complete All 7** → Choose date for Trial 2 (modified welcome screen)

### Phase 3: Post-Paywall (Full Access)

1. **Forever Landing Page** → ChakraHub (chakras in cross pattern)
2. **Permanent Menu Bar** (bottom, can hide/expand):
   - Home
   - Gallery
   - Sanctuary
   - Diary
3. **Top Bar**:
   - Chakra wheel logo (home button) - center with "7"
   - Tiny white note (right) → Audio section
4. **Buttons Still Present**:
   - Leaf button (left) → Notes
   - Anua button (right) → Social Sanctuary Modal
5. **Audio Section**:
   - Trials: Only clicked audio
   - Full Access: All 1-hour crystal bowls first, then all meditations
6. **Social Sanctuary** - Full features in full open mode

---

## Key Principles for Restoration

1. **Work gently** - Adjust what exists, don't break things
2. **Methodical** - One change at a time, test as we go
3. **Cohesive** - Maintain the strong foundation we started with
4. **Simple** - Keep trials flowing with simplicity
5. **Clean** - Nothing else should show during trials beyond the core buttons

---

## Questions for Clarification

1. **Leaf/Notes Button** - Should this be a single button that opens notes, or separate buttons?
2. **Permanent Menu Bar** - Currently shows globally. Should it be conditionally hidden during trials based on `hasLifetimeAccess`?
3. **Anua Button Location** - Bottom right? Should it conflict/overlap with permanent menu bar?
4. **Audio Section** - Where is the "tiny white note" icon located? Top right? Does it open a modal or navigate to a screen?
5. **Goodbye Modal Home Option** - Should this navigate back to ChakraHome or ChakraHub?
