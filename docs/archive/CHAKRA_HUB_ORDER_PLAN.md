# ChakraHub Chakra Balls Layout Plan

## Current Issue

The chakra balls on the ChakraHub (APP2) screen are in the wrong order:

- **Current:** Root at top-left, Crown at bottom-center (top-to-bottom, left-to-right)
- **Desired:** Root at bottom, Crown at top (bottom-to-top, left-to-right)

## User Specification

- **Order:** Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown
- **Layout direction:** Bottom to top, then left to right
- **Root position:** Bottom-right area (where Crown is now)
- **Crown position:** Top (where Root is now)

## Target Visual Layout

```
        [Crown]           ← Top row (Sunday)
    [Heart] [Throat] [Third Eye]   ← Middle row (Thu, Fri, Sat)
[Root] [Sacral] [Solar Plexus]     ← Bottom row (Mon, Tue, Wed)
```

## Implementation

### File: `app/(chakras)/ChakraHub.tsx`

### Current Structure (lines 188-292)

```tsx
<View className="flex-row flex-wrap justify-center gap-4">
    {hubChakraData.map(...)}
</View>
```

- `flex-row flex-wrap` fills left-to-right, then wraps to next row top-to-bottom
- Data order: Root→Crown, so Root renders top-left, Crown renders bottom-center

### Change Required

1. **Split data into rows** (bottom, middle, top):
   - Bottom row: Root (0), Sacral (1), Solar Plexus (2)
   - Middle row: Heart (3), Throat (4), Third Eye (5)
   - Top row: Crown (6)

2. **Use `flexDirection: 'column-reverse'`** on the container so the first row in the DOM renders at the bottom of the screen.

3. **Render rows explicitly** with `flexDirection: 'row'` and `justifyContent: 'center'` for each row.

### Code Approach

```tsx
<View style={{ flexDirection: 'column-reverse', alignItems: 'center', gap: 16 }}>
  {/* Row 1 - Bottom (Root, Sacral, Solar) */}
  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
    {hubChakraData.slice(0, 3).map(...)}
  </View>
  {/* Row 2 - Middle (Heart, Throat, Third Eye) */}
  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
    {hubChakraData.slice(3, 6).map(...)}
  </View>
  {/* Row 3 - Top (Crown) */}
  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
    {hubChakraData.slice(6, 7).map(...)}
  </View>
</View>
```

Or more elegantly: chunk the data into `[[0,1,2], [3,4,5], [6]]` and map over rows, then items.

### Preserve Existing Behavior

- Keep `hubChakraData` order as-is (Root→Crown) – no change to data
- Keep individual chakra item styling, PulsingButton, check ball, labels
- Keep `handleNavigateToChakra` and `isCurrentDay` logic
- Adjust `width` – each item was `width: '30%'` in a flex-wrap; with explicit rows, use consistent sizing (e.g. `width: 80` or `minWidth`)

### Summary

| Change    | Detail                                                        |
| --------- | ------------------------------------------------------------- |
| Container | `flexDirection: 'column-reverse'` so first row = bottom       |
| Rows      | 3 rows: [Root,Sacral,Solar], [Heart,Throat,ThirdEye], [Crown] |
| Data      | No reorder; slice existing `hubChakraData` by indices         |
| Sizing    | Ensure items have consistent width within rows                |
