# Changes Inventory - What's Different from Main

## Summary

- **206 files** have changed from main branch
- Main branch has **1 commit**: "Initial commit: Complete 7 Chakras app with all features"
- Current state has many modifications

## Key Modified Files (Code)

### Core Components

- `components/chakras/ChakraHome.tsx` - Main home screen
- `components/chakras/IntegratedProgressStack.tsx` - Chakra display component
- `components/chakras/WelcomeModal.tsx` - First launch modal
- `components/chakras/WaitingScreen.tsx` - Waiting room screen
- `components/chakras/ChakraTemplate.tsx` - Individual chakra day screen

### App Structure

- `app/_layout.tsx` - Root layout
- `app/(chakras)/_layout.tsx` - Chakra routes layout
- `app/(chakras)/[chakra].tsx` - Dynamic chakra route
- `app/AudioPlayer.tsx` - Audio playback

### Services

- `src/services/gemini.ts` - Anua AI service
- `src/services/elevenlabs.ts` - Voice synthesis
- `src/services/revenuecat.ts` - Payment/subscriptions
- `src/services/socialSanctuary.ts` - Community features
- `src/services/timegate.ts` - Course time gating
- `src/services/anuaNavigation.ts` - Navigation service
- `src/services/anuaCommunityCache.ts` - Community cache

### Hooks

- `hooks/useChakraJourneyStore.ts` - Journey state
- `hooks/useChakrasData.ts` - Chakra data fetching
- `hooks/useEmbodimentAudio.ts` - Audio handling
- `hooks/useRevenueCat.ts` - Payment hooks

### Utilities

- `utils/date.ts` - Date calculations
- `src/utils/apiHelpers.ts` - API utilities
- `src/utils/rateLimiter.ts` - Rate limiting

### Configuration

- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `app.config.js` - Expo config
- `tailwind.config.js` - Styling config

## New Files Added (Not in Main)

- Many new components in `components/` directory
- New services in `src/services/`
- New hooks in `hooks/`
- Documentation files (`.md` files)
- `7-chakras-master-path/` folder (appears to be old/backup)

## Recovery Options

### Option 1: Full Restore to Main

```bash
git checkout main
git reset --hard main
```

**Result**: Complete restoration to original state
**Risk**: Lose all changes (good and bad)

### Option 2: Selective Restore

1. Restore to main
2. Cherry-pick specific good changes
3. Test each change individually

### Option 3: Create New Branch from Main

```bash
git checkout main
git checkout -b recovery-clean-start
```

**Result**: Clean slate, then add back only good changes

## Next Steps

1. **You provide list of favorite updates** - What to keep?
2. **I'll create reintegration plan** - Step by step
3. **We restore to main first** - Get to known good state
4. **Then carefully add back** - One change at a time

---

**Status**: Ready for your list of favorite updates to preserve
