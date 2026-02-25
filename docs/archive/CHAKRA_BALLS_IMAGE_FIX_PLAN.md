# Chakra Balls Image Fix Plan

## Problem

All chakra balls on the ChakraHub (lifetime home screen) render as root chakra balls. Labels are correct (Heart, Throat, Crown, etc.) but every ball shows the root image.

## Root Cause

ChakraHub builds `hubChakraData` from `useChakrasData()`:

```javascript
source: chakraData?.source || require('@/assets/images/root.png'),
```

When `useChakrasData` fails (Firestore not ready, network, rate limit, etc.), `chakrasData` is `[]`. For every chakra, `chakraData` is undefined, so the fallback `root.png` is used for ALL chakras.

## Fix (Gentle)

Do not depend on Firestore for chakra ball images. Use a static day-index-to-image map when `chakraData?.source` is unavailable. The images are local assets—no need to fetch from Firestore.

## Implementation

1. Add `DAY_INDEX_TO_CHAKRA_IMAGE` constant in ChakraHub (or import from shared source).
2. Change fallback from `require('@/assets/images/root.png')` to `DAY_INDEX_TO_CHAKRA_IMAGE[dayIndex]`.
3. No changes to `useChakrasData`, HeaderBackground, or other hero components.

## Files to Modify

- `app/(chakras)/ChakraHub.tsx` only
