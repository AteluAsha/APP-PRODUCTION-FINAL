# Soft Cleanup Audit – 7 Chakras / Bloomly App

**Date:** Feb 4, 2026  
**Scope:** Unused dependencies, dead code, unreferenced assets. No deletions performed; this is an approval checklist only.  
**Risk focus:** Low or no risk only; estimated size savings where applicable.

---

## 1. Unused Dependencies (package.json vs codebase)

| Package                  | Used in code?                                                       | Risk to remove                        | Est. size (approx)     | Recommendation                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **react-native-webview** | **No** – zero `import` or `WebView` usage in `.ts`/`.tsx`/`.js`     | **Low**                               | ~980 KB (node_modules) | **Safe to remove.** Run `npm uninstall react-native-webview`, then `npx pod-install` if you use iOS. Confirm no reference in `app.config.js` or native config (none found). |
| expo-updates             | No direct JS import; used by Expo/iOS for OTA (Expo.plist, Podfile) | Do not remove                         | —                      | **Keep.** Required for EAS/Expo OTA updates even if your app code never calls `Updates.*`.                                                                                  |
| html2canvas              | Yes – only in `components/dev/CaptureAll.tsx` (web, dev)            | Remove only if dev capture is removed | —                      | Keep unless you delete the dev screenshot flow (see Dead Code).                                                                                                             |
| @types/html2canvas       | Dev type support for above                                          | Same as html2canvas                   | —                      | Keep if keeping html2canvas.                                                                                                                                                |
| All other deps           | Used (verified via grep for imports/usage)                          | —                                     | —                      | No change.                                                                                                                                                                  |

**Summary (dependencies):** One clear, low-risk removal: **react-native-webview** (~980 KB). Everything else is either used or required by the Expo/runtime stack.

---

## 2. Dead Code

### 2a. Components never imported (safe to delete)

| Item                    | Location                                     | Risk    | Notes                                                                      |
| ----------------------- | -------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| **DonationModal**       | `components/chakras/DonationModal.tsx`       | **Low** | No imports anywhere. Modal exists but is never opened.                     |
| **LunarPhaseBadge**     | `components/chakras/LunarPhaseBadge.tsx`     | **Low** | No imports. `CosmicMomentCompact` uses its own inline lunar phase display. |
| **CosmicMomentCompact** | `components/chakras/CosmicMomentCompact.tsx` | **Low** | No imports anywhere. Day/lunar UI is exported but never used.              |

**Estimated size:** Small (few KB of source). Main benefit is less code to maintain and a cleaner tree.

### 2b. Commented-out code (no-risk cleanup)

| Location                                           | What                                                               | Risk                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `components/chakras/ChakraHome.tsx` (lines ~39–42) | Commented imports for `FrequencyHealingIcon` and `MiniAudioPlayer` | **None** – remove the 4 commented lines. `FrequencyHealingIcon` component file no longer exists. |
| `app/_layout.tsx` (lines ~459–476)                 | Commented block for CaptureAll / StaticGallery (web dev)           | **None** – optional: shorten or keep as-is for future screenshot runs.                           |

### 2c. MiniAudioPlayer

- **File:** `components/chakras/MiniAudioPlayer.tsx`
- **Usage:** Only referenced in commented-out import in `ChakraHome.tsx` and in a comment in `SoundBath.tsx` (“MiniAudioPlayer removed from SoundBath”).
- **Risk:** **Low** to delete the component file and the commented import. No other references.

### 2d. Dev-only components (optional “shake”)

- **DevGalleryTrigger** – Not rendered anywhere in the app (not in `_layout` or any route). Only references: inside `StorybookShell` (comment) and in `DevGalleryTrigger.tsx` itself.
- **DevGallery, StorybookShell, StaticGallery, CaptureAll, SnapshotUtility, SafeRoomWrapper** – Only used from `DevGalleryTrigger` or from `_layout` when you uncomment the web dev block (CaptureAll/StaticGallery).

**Risk:** **Low** if you never use the dev gallery or screenshot capture. **Medium** if you might run CaptureAll again for app store screenshots.  
**Suggestion:** Leave in place unless you want to remove all dev-only UI; then you could remove the whole `components/dev/` folder and the `html2canvas` (and `@types/html2canvas`) dependency.  
**Est. size:** ~2.1k lines of code + html2canvas in node_modules.

---

## 3. Asset Audit – Never referenced in code

All references were searched for: `assets/images/`, `assets/audio/`, `assets/fonts/`, `assets/svg/`, `assets/data/`, and `require("@/assets/...)` / `require("../assets/...)` patterns.

### 3a. Images (assets/images/) – unreferenced

| File                                           | Est. size | Risk                                  |
| ---------------------------------------------- | --------- | ------------------------------------- |
| **rootElementsBackground.png**                 | ~2.5 MB   | **Low** – not required or referenced. |
| **CommunityHalls_Sanctuary_HeroLogo_NoBG.png** | ~640 KB   | **Low** – not referenced.             |
| **CommunityHalls_HeroIcon_VisicaPiscis.png**   | ~44 KB    | **Low** – not referenced.             |

**Total images (unreferenced):** ~3.2 MB

### 3b. SVG (assets/svg/)

| File                | Est. size | Risk                                                                                                                |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| **headtoheart.svg** | ~4 KB     | **Low** – not imported. HeadToHeart screen uses `chakraContent[chakra].headtoheart` (text content), not this asset. |

### 3c. All other assets

- **Audio:** All 4 files in `assets/audio/` are referenced (content.tsx, \_layout preload, etc.).
- **Fonts:** All referenced in `app/_layout.tsx` (font loading).
- **Data:** `ChakraQuizzes/chakra_quizzes.json` used in `QuizScreen.tsx`.
- **Images:** Every other image under `assets/images/` is required or preloaded in `_layout` / content / components.

### 3d. Backup folder (optional, large saving)

| Path             | Est. size   | Risk                                                                                                                                        |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **app/backups/** | **~195 MB** | **Low** – full copy of `assets` (audio, data, dev-gallery, fonts, images, svg). Safe to delete if you have assets in git or another backup. |

**Total asset-related savings (if you approve all above):**  
~3.2 MB (unreferenced images + SVG) + **~195 MB** (backup folder) ≈ **~198 MB**.

---

## 4. Other ideas (low / no risk)

1. **Root-level markdown**  
   There are 200+ `.md` files (plans, audits, fix logs). Moving completed/obsolete ones to a single `docs/archive/` or `docs/plans/` folder keeps the root clean without affecting app size or behavior. **Risk: none.**

2. **expo-updates**  
   Left in place on purpose; needed for EAS/OTA. No action.

3. **Preload list in \_layout**  
   Your `_layout` preloads a fixed set of images/audio. When you switch to Firebase-hosted audio, you can stop preloading those placeholders and rely on the runtime/Firebase URLs. That’s a separate, small change when you wire Firebase audio.

---

## 5. Summary table for your approval

| Category  | Item                                                                                           | Risk       | Est. size saving |
| --------- | ---------------------------------------------------------------------------------------------- | ---------- | ---------------- |
| Deps      | Remove `react-native-webview`                                                                  | Low        | ~980 KB          |
| Dead code | Delete `DonationModal.tsx`                                                                     | Low        | Small            |
| Dead code | Delete `LunarPhaseBadge.tsx`                                                                   | Low        | Small            |
| Dead code | Delete `CosmicMomentCompact.tsx`                                                               | Low        | Small            |
| Dead code | Remove commented imports (ChakraHome, FrequencyHealingIcon + MiniAudioPlayer)                  | None       | —                |
| Dead code | Delete `MiniAudioPlayer.tsx` (optional)                                                        | Low        | Small            |
| Assets    | Delete `assets/images/rootElementsBackground.png`                                              | Low        | ~2.5 MB          |
| Assets    | Delete `assets/images/CommunityHalls_Sanctuary_HeroLogo_NoBG.png`                              | Low        | ~640 KB          |
| Assets    | Delete `assets/images/CommunityHalls_HeroIcon_VisicaPiscis.png`                                | Low        | ~44 KB           |
| Assets    | Delete `assets/svg/headtoheart.svg`                                                            | Low        | ~4 KB            |
| Assets    | Delete `app/backups/` (optional)                                                               | Low        | **~195 MB**      |
| Optional  | Remove or archive `components/dev/` + html2canvas (only if you don’t need dev gallery/capture) | Low–Medium | Code + deps      |

**Total estimated savings (excluding optional dev/ and backups):** ~4 MB (deps + unreferenced assets).  
**With backups folder:** ~199 MB.  
**With optional dev removal:** additional codebase and dependency reduction (no numeric size estimated for app bundle here).

Nothing has been deleted; use this list to approve removals in your repo and tooling (e.g. EAS build) as you see fit.
