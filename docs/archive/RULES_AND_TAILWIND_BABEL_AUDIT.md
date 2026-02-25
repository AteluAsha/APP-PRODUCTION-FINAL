# Rules and Tailwind/Babel Audit

## Block/Prevent Rules – Verified

- **.gitignore**  
  Excludes: `7-chakras-master-path/`, `assets/dev-gallery/snapshots/`, build/node/env artifacts.  
  Does **not** block `hooks/`, `components/`, `app/`, or main `assets/`. Logic correct.

- **.easignore**  
  Mirrors .gitignore for EAS; also excludes `ios/`, `android/`, `android/_backups/`, `*.md`, `*.log`.  
  Does **not** exclude `assets/images` or source. Logic correct.

- **metro.config.js**  
  No blockList. `withNativeWind(config, { input: "./globals.css" })`; SVG transformer. No path blocking.

- **tsconfig.json**  
  Excludes: `node_modules`, `.expo`, `dist`, `7-chakras-master-path`. No blocking of app/components/hooks.

- **babel.config.js**  
  Presets: `babel-preset-expo` (jsxImportSource: nativewind), `{ plugins: cssInteropBabel.plugins }`.  
  No root-level `react-native-reanimated/plugin`; reanimated expected inside css-interop. Do **not** reintroduce `"nativewind/babel"` without resolving worklets/Reanimated 4.

---

## Tailwind/Babel Connections

- **globals.css**  
  `@tailwind base/components/utilities`; imported in `app/_layout.tsx`.

- **tailwind.config.js**  
  `content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]`; nativewind preset; fontFamily extended.  
  Constants/utils not in content (no JSX Tailwind there).

- **Strategy**  
  Do **not** rely on `className` alone for visibility or layout. Use **explicit `style`** for:
  - Text color (AppText default + key screens).
  - Image dimensions and key layout (position, width, height, padding, margin, flex) for critical Views/Images/Pressables.

---

## Summary

Block/prevent rules are correct. Tailwind/Babel is wired via top-level `react-native-css-interop/babel`; dynamic or className-only styles may not apply at runtime. Restore production-approved display by adding explicit `style` for critical UX elements.
