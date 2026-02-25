# HomeScreen 1 vs HomeScreen 2 Verification

## HomeScreen 1: ChakraHome (Trials Only - !hasLifetimeAccess)

**File:** `components/chakras/ChakraHome.tsx`

**Shown When:** `!hasLifetimeAccess` (trials)

### UX Elements (Trials Only):

- ✅ Progressive chakra reveal (one per day)
- ✅ Gallery button (top right) - only shows if cards unlocked
- ✅ "Learn About Chakras" button (top right) - only for trials
- ✅ Day progress indicator (Day X of 7)
- ✅ IntegratedProgressStack (chakra stack display)
- ✅ GoodbyeModal navigation back to ChakraHome
- ✅ FloatingNavButtons (Leaf + Anua) - positioned for trials

### Should NOT Have:

- ❌ ChakraHub button (removed - only post-paywall)
- ❌ PermanentMenuBar (only post-paywall)
- ❌ All chakras accessible at once

## HomeScreen 2: ChakraHub (Post-Paywall Only - hasLifetimeAccess)

**File:** `app/(chakras)/ChakraHub.tsx`

**Shown When:** `hasLifetimeAccess === true` (post-paywall)

### UX Elements (Post-Paywall Only):

- ✅ All 7 chakras accessible at once (cross pattern)
- ✅ Chakras 101 icon (top left)
- ✅ Gallery button (in menu)
- ✅ Community Halls button (in menu)
- ✅ PermanentMenuBar (bottom) - Home, Music, Community, Gallery
- ✅ FloatingNavButtons (Leaf + Anua) - positioned above menu bar
- ✅ ActionBar (top)

### Should NOT Have:

- ❌ Day progress indicator
- ❌ Progressive chakra unlock
- ❌ "Learn About Chakras" button (has icon instead)
- ❌ Waiting screen logic

## Routing Logic

**Entry Point:** `app/(chakras)/index.tsx`

- Should route to ChakraHome for trials
- Should route to ChakraHub for post-paywall

## Global Components

**PermanentMenuBar** (`components/navigation/PermanentMenuBar.tsx`):

- ✅ Only renders when `hasLifetimeAccess === true`
- ✅ Hidden completely for trials

**FloatingNavButtons** (`components/navigation/FloatingNavButtons.tsx`):

- ✅ Renders for both trials and post-paywall
- ✅ Positioning changes based on `hasLifetimeAccess`
- ✅ Trial: Leaf (left, top), Anua (bottom-right)
- ✅ Post-paywall: Leaf (above menu bar, left), Anua (above menu bar, right)

## Verification Checklist

### ChakraHome (HomeScreen 1 - Trials):

- [x] No Hub button
- [x] Gallery button only shows for trials (!hasLifetimeAccess)
- [x] "Learn About Chakras" only shows for trials
- [x] Progressive chakra reveal
- [x] Day progress indicator
- [x] No developer tools
- [x] GoodbyeModal routes back to ChakraHome for trials

### ChakraHub (HomeScreen 2 - Post-Paywall):

- [x] All chakras accessible
- [x] Chakras 101 icon present
- [x] PermanentMenuBar shows (rendered globally)
- [x] No progressive unlock logic
- [x] No day progress indicator

### Separation:

- [x] ChakraHome only for trials
- [x] ChakraHub only for post-paywall
- [x] No overlap in functionality
- [x] Clear routing based on hasLifetimeAccess
