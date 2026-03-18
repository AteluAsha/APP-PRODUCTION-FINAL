# Why Goodbye Screen Updates May Not Appear

## Investigation summary

- **Single source of truth:** There is only one Goodbye screen component: `components/chakras/GoodbyeModal.tsx`. No `.ios.tsx` / `.native.tsx` override.
- **Usages:** GoodbyeModal is used in:
  - `components/chakras/ChakraTemplate.tsx` (course day screen – e.g. completing Monday Root Day)
  - `components/chakras/ChakraHome.tsx` (trial home when `completedChakra` is set)
  - `app/(chakras)/ChakraHub.tsx` (lifetime home when `completedChakra` is set)
- **Code in repo:** The layout changes are present in `GoodbyeModal.tsx`:
  - iOS uses in-flow bottom section (`bottomSectionInFlow` + `bottomSectionInFlowIOS`) so the bottom block is part of the same column as the ScrollView.
  - ScrollView has `style={{ flex: 1, minHeight: 0 }}` so it can shrink and the bottom section stays on screen.

## Most likely reason you see zero change: bundle / cache

The app is probably **not loading the updated JS bundle**. If the simulator or device is using an old bundle (Metro cache, or a build that doesn’t talk to Metro), you will still see the old layout no matter what we change in `GoodbyeModal.tsx`.

## How to confirm

A **bright green (lime) 3px border** was added around the bottom section **only in `__DEV__`**. When you open the Goodbye screen in dev:

- **If you see the green border:** The new bundle is loading. The layout fix is in effect; if “Open Your Gift” and “Home” still don’t sit at the bottom, the next step is to adjust the layout (e.g. flex or padding).
- **If you do not see the green border:** The app is not running the new code. Clear caches and force a fresh bundle (see below).

## What to do if the bundle is not updating

1. **Stop Metro** (Ctrl+C in the terminal where it’s running).
2. **Clear caches and restart:**
   ```bash
   npx expo start --clear
   ```
   Then press `i` for iOS simulator (or connect device and reload).
3. **Or do a full clean run:**
   ```bash
   rm -rf node_modules/.cache .expo
   npx expo start --clear
   ```
   Then in the simulator: **Cmd+R** (or Shake → Reload) after the app loads.
4. **If you use a development build** (e.g. `expo run:ios`): run the same command again so the app is reinstalled and Metro is used; then keep that terminal open and reload (Cmd+R) after opening the Goodbye screen.

## Remove the green border later

Once you’ve confirmed the bundle is updating, remove the dev-only border by deleting the line in `GoodbyeModal.tsx`:

```ts
__DEV__ && { borderWidth: 3, borderColor: "lime" },
```

(from the bottom section `View`’s `style` array).
