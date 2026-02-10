# Sanctuary Flow Analysis - App 1 & App 2

## Current State Analysis

### Notes Along the Way (JourneyNotesView)
- ✅ **Available in App 1**: Yes, via FloatingNavButtons (Leaf button)
- ✅ **Available in App 2**: Yes, via FloatingNavButtons (Leaf button)
- ✅ **Storage**: Always stored, never deleted unless user chooses (useJourneyNotesStore with AsyncStorage)
- ✅ **No hasLifetimeAccess gate**: Works for both apps

### Community Halls
- ✅ **Available in App 1**: Yes, via SocialSanctuaryModal → Community Halls button
- ✅ **Available in App 2**: Yes, via SocialSanctuaryModal → Community Halls button
- ⚠️ **Limited Mode**: Hidden when `isLimitedMode === true` (only on Chakras101 page in trial)

### Social Sanctuary Modal
- ✅ **Anua Chat**: Always available (both App 1 and App 2)
- ⚠️ **Share with Community**: Hidden when `isLimitedMode === true`
- ⚠️ **Community Halls**: Hidden when `isLimitedMode === true`

### Limited Mode Logic
- **Current**: `isLimitedMode = !hasLifetimeAccess && isChakras101Page`
- **Effect**: Only limits on Chakras101 page in trial mode
- **Other screens**: Full access to Notes and Community Halls

---

## Requirements

### User Request:
1. Notes and Community Halls should be **open to App 1 when first Monday opens**
2. These functions live in App 2 but should be open to App 1
3. Notes are always stored and never deleted unless user chooses
4. Check sanctuary flows for conflicts

### Analysis:
- ✅ **Notes**: Already available in App 1 (no changes needed)
- ⚠️ **Community Halls**: Currently hidden in limited mode (only on Chakras101)
- ✅ **Storage**: Notes already persist correctly
- ⚠️ **Need to verify**: When first Monday opens, are Notes and Community Halls accessible?

---

## Recommendations

### 1. Notes Along the Way ✅ Already Working
- No changes needed
- Available via Leaf button in FloatingNavButtons
- Works for both App 1 and App 2
- Storage persists correctly

### 2. Community Halls ⚠️ Needs Verification
- Currently accessible via SocialSanctuaryModal
- Hidden only when `isLimitedMode === true` (Chakras101 page)
- Should be accessible when first Monday opens (journeyStarted === true)

### 3. Sanctuary Flow Conflicts ⚠️ Need to Check
- Limited mode only applies to Chakras101 page
- Should verify no conflicts between App 1 and App 2

---

## Action Items

1. ✅ Verify Notes are accessible when first Monday opens
2. ⚠️ Verify Community Halls are accessible when first Monday opens
3. ⚠️ Check if limited mode should apply to waiting room (currently only Chakras101)
4. ⚠️ Ensure no conflicts between App 1 and App 2 sanctuary flows
