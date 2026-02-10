# App-Wide Styling Audit (Post Babel Restore)

**Date:** After restoring `babel.config.js` to use `"nativewind/babel"` directly.

## 1. Babel (critical – already fixed)

- **Status:** Restored to original. Preset `"nativewind/babel"` is used directly; no wrapper.
- **Worklets:** NativeWind’s nested `react-native-css-interop` (0.2.1) requires `react-native-worklets/plugin` (Reanimated 4). We use Reanimated 3. A **no-op stub** at `node_modules/react-native-worklets/plugin.js` satisfies the require; `scripts/ensure-worklets-stub.js` runs in `postinstall` to keep the stub after `npm install`.

## 2. Metro

- **metro.config.js:** Uses `withNativeWind(config, { input: "./globals.css" })`. SVG transformer and blockList are set. No change made.
- **Note:** If you ever see CSS or Tailwind not updating, try clearing Metro cache (`npx expo start -c` or the clear script).

## 3. Tailwind

- **tailwind.config.js:** Content includes `./app/**/*.{js,jsx,ts,tsx}` and `./components/**/*.{js,jsx,ts,tsx}`. Font families match `useFonts` keys. No change made.
- **globals.css:** Standard Tailwind directives. Imported in `app/_layout.tsx`. No change made.

## 4. TypeScript / NativeWind types

- **nativewind-env.d.ts:** Present with `/// <reference types="nativewind/types" />`.
- **tsconfig.json:** Includes `nativewind-env.d.ts`. No change made.

## 5. Root layout

- **app/_layout.tsx:** Imports `../globals.css`. No duplicate or conflicting style imports. No change made.

## 6. AppText and tailwind-variants

- **AppText** uses `tailwind-variants` and outputs `className`. With Babel restored, those classes are compiled by NativeWind. No change made.

## 7. contentContainerClassName

- Used in RevenueCatPaywall, EnergyExchange, HeadToHeart, Chakras101, Donate. NativeWind v4 can support this on ScrollView in some setups. Left as-is; if any of those screens have layout issues we can switch to `contentContainerStyle` for that screen only.

## 8. Scripts

- **start** and **start:clear** use `env -u CI` so Metro does not run in CI mode when using `npm start`. When using `npx expo run:ios`, Metro is started by the CLI; for a full clean run we clear caches and then run iOS.

## 9. No other issues found

- No other Babel plugins or presets found that would override or conflict with NativeWind.
- No app-wide style overrides or theme providers that would block Tailwind.
- Fonts are loaded in root layout and mapped in Tailwind; with Babel fixed, font classes should resolve.

## 10. Recommended run after any styling or Babel change

```bash
# Stop any running Metro, then:
./scripts/clear-and-run-ios.sh
```

Or manually: kill Metro, `rm -rf node_modules/.cache .expo`, run `watchman watch-del-all` if available, then `npx expo run:ios`.
