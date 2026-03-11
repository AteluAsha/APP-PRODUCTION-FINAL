# Android and Global Fixes Audit (ChakraHub / Profile / Menu)

Methodical audit of recent Android-specific and global fixes. Use this to ensure master code and iOS get the same UX improvements where appropriate before production.

---

## 1. Files Touched (Summary)

| File | Purpose |
|------|--------|
| `app/(chakras)/ChakraHub.tsx` | Lifetime home; back arrow, ActionBar |
| `app/(chakras)/ProfileMenu.tsx` | Full menu as route (Android ChakraHub) |
| `app/(chakras)/Profile.tsx` | Profile-only route (both platforms) |
| `app/(chakras)/_layout.tsx` | Stack screens: ProfileMenu, Profile |
| `app/_layout.tsx` | Root: ProfileSheet then ChakraHubHeader, StatusBar |
| `components/navigation/ChakraHubHeader.tsx` | Hamburger (left) + Profile (right), open logic |
| `components/navigation/FloatingUIRevealStrip.tsx` | No reveal on ChakraHub lifetime |
| `components/profile/ProfileSheet.tsx` | Modal + asScreen/profileOnly, Help, profile-only UI |
| `constants/sharing.ts` | SUPPORT_EMAIL, existing URLs |
| `docs/ANDROID_16KB_COMPATIBILITY_DIALOG.md` | 16 KB system dialog note |
| `docs/ANDROID_AND_GLOBAL_FIXES_AUDIT.md` | This audit |

---

## 2. Android-Only (Keep Gated)

These address Android-specific bugs or behavior. Do **not** remove the `Platform.OS === "android"` checks.

| Location | What | Why Android-only |
|----------|------|-------------------|
| **ChakraHubHeader** | `elevation: 9999` on icon wrap | Android uses elevation for stacking; iOS uses zIndex only. |
| **ChakraHubHeader** | Hamburger opens **route** on Android, **Modal** on iOS (before global fix) | Android Modal overlay was blocking the screen; route fixes it. After audit fix: both use route. |
| **ProfileSheet** | `statusBarTranslucent: true` on Modal | Android Modal window behavior; not used on iOS when using route from ChakraHub. |
| **ProfileSheet** | `overlayAndroid` (absolute full-screen overlay) | Android Modal layout; iOS unchanged. |
| **ProfileSheet** | `androidContentVisible` + 80 ms delay before showing card content | Works around RN/Android 13+ transparent Modal content not painting. |
| **ProfileSheet** | Card `elevation: 24` on Android | Ensures card draws above overlay on Android. |
| **_layout.tsx** | StatusBar `translucent` + `backgroundColor: "transparent"` | Android status bar handling. |
| **ChakraHub** | `SCROLL_ANDROID_SMOOTH_PROPS` on ScrollView | Android scroll behavior. |

---

## 3. Global Fixes (Apply to Master / iOS Too)

These improve the app for all platforms. They are already implemented globally unless noted.

| Fix | Where | Applies to |
|-----|--------|------------|
| **No back arrow on ChakraHub** | `ChakraHub.tsx`: `ActionBar showBackButton={false}` | All. ChakraHub is root for lifetime; no back. |
| **Two separate icons** | ChakraHubHeader: hamburger left, profile right, 24px inset | All. Same layout and touch targets. |
| **Profile icon → Profile route** | ChakraHubHeader: `router.push("/(chakras)/Profile")` (no Platform check) | All. Profile-only screen (ID, name, photo) as route. |
| **Hamburger → full menu** | ChakraHubHeader: after audit fix, `router.push("/(chakras)/ProfileMenu")` on **both** platforms | All. Unifies behavior; avoids Modal from ChakraHub on iOS too. |
| **No reveal strip on ChakraHub (lifetime)** | FloatingUIRevealStrip: `isChakraHubLifetime` → hide | All. No strip/reveal overlay on lifetime home. |
| **Root layer order** | _layout: ProfileSheet then ChakraHubHeader, ChakraHubHeader zIndex 9999 | All. Header on top when Modal closed. |
| **Larger header icons** | ChakraHubHeader: 48×48, icon 26, hitSlop 20, press opacity | All. Better touch and visibility. |
| **Profile-only screen UX** | ProfileSheet when `profileOnly`: wider card (420), larger avatar (140), larger name (xl), no redundant “Tap Edit” line, Help section, contact email | All. Profile route uses this on both platforms. |
| **Help section in menu** | ProfileSheet: Help under Account, mailto SUPPORT_EMAIL, “we are healers and humans” copy | All. In both Modal and ProfileMenu route. |
| **Wider profile-only card** | ProfileSheet: profileOnlyCard, profileOnlyGradient, profileOnlyOverlay | All. |

---

## 4. Entry Points: Modal vs Route

| Entry point | Opens | Platform behavior (after audit) |
|-------------|--------|----------------------------------|
| **ChakraHub – hamburger** | Full menu | **Both:** `router.push("/(chakras)/ProfileMenu")` |
| **ChakraHub – profile** | Profile only | **Both:** `router.push("/(chakras)/Profile")` |
| **ChakraHome – waffle** | Full menu | **Both:** `useProfileSheetStore.getState().open()` → Modal |
| **TribeChatContent** | Full menu | **Both:** `useProfileSheetStore.getState().open()` → Modal |

So: from ChakraHub we always use routes; from ChakraHome and Tribe we still use the Modal. That gives consistent ChakraHub UX and keeps existing behavior elsewhere.

---

## 5. Recommended Change for Master / iOS

**Unify ChakraHub hamburger on iOS:** open the full menu via the same route as Android instead of the Modal.

- **Current:** Android → `router.push("/(chakras)/ProfileMenu")`; iOS → `useProfileSheetStore.getState().open()` (Modal).
- **Recommended:** Both → `router.push("/(chakras)/ProfileMenu")`.

Benefits:

- One code path from ChakraHub (routes only).
- Same UX on both platforms (no Modal from ChakraHub).
- Avoids any future Modal quirks on iOS from that screen.
- ProfileSheet Modal still used from ChakraHome and Tribe as today.

Implementation: In `ChakraHubHeader.tsx`, change `openHamburger` to always call `router.push("/(chakras)/ProfileMenu")` and remove the `Platform.OS === "android"` branch for that action.

---

## 6. What Stays Android-Only (Quick Reference)

- ChakraHubHeader: `elevation: 9999` on the icon wrapper.
- ProfileSheet Modal: `statusBarTranslucent`, `overlayAndroid`, `androidContentVisible` delay, card `elevation: 24` (only when Modal is used).
- _layout: StatusBar `translucent` and transparent background on Android.
- ChakraHub ScrollView: `SCROLL_ANDROID_SMOOTH_PROPS`.
- 16 KB compatibility dialog: system-only; doc in `ANDROID_16KB_COMPATIBILITY_DIALOG.md`.

---

## 7. Checklist for Production

- [ ] ChakraHub: no back arrow (`showBackButton={false}`).
- [ ] ChakraHub header: hamburger left, profile right, 24px inset, 48×48 icons.
- [ ] From ChakraHub: hamburger → ProfileMenu route, profile → Profile route (both platforms).
- [ ] Profile-only screen: wide card, large avatar/name, no redundant copy, Help/contact.
- [ ] Help section: copy + mailto SUPPORT_EMAIL.
- [ ] FloatingUIRevealStrip hidden on ChakraHub when lifetime.
- [ ] Android-only: elevation, statusBarTranslucent, overlayAndroid, content delay, SCROLL_ANDROID_SMOOTH_PROPS left as-is.
