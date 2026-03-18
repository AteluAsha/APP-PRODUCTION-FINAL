# Permanent Menu Bar – Global Audit (App1 / App2, Trial / Lifetime)

**Date:** Audit after waiting-room cleanup.  
**Scope:** Every route; correct items per user type and page (including exceptions like waiting room).

---

## 1. When the menu bar is HIDDEN (returns `null`)

| Condition | Pages / pathnames |
|-----------|--------------------|
| Goodbye modal open | Any (modal over current screen) |
| Onboarding / selection | `DateSelection`, `WelcomeScreen`, index (stillness), `"/"`, undefined pathname |
| Paywall / gates | `CommitmentGate`, `Paywall`, `DevPaywall`, `EnergyExchange` |
| Full-screen / overlay routes | `TribeChat`, `AudioPlayer`, `CommunityHalls`, `NotesAlongTheWay`, `AnuaChat`, `GiftChakra` |
| Lifetime on trial waiting room | When `isWaitingScreenVisible && hasLifetimeAccess` (they use "Exit course mode") |

**Fix applied:** Menu bar was incorrectly hidden on **ChakraHome** because `isWelcomeScreen` used `isRootChakrasRoute`, which is true for both `/(chakras)/index` and `/(chakras)/ChakraHome`. It now hides only on index (stillness), WelcomeScreen, and DateSelection, so **ChakraHome and the waiting room show the menu bar** as intended.

---

## 2. Menu ITEMS by user type and context

### App1 – Trial (no lifetime access)

| Context | Menu items | Arrow | Layout |
|--------|------------|-------|--------|
| **Trial waiting room** (`isWaitingScreenVisible`) | Preview, Chakras 101, Anua, Notes | No | Horizontal bottom |
| **Trial elsewhere** (ChakraHome main, day screens, etc.) | Sanctuary, Anua, Notes, Tribe | Yes | Horizontal or vertical (by route) |

### App2 – Lifetime (has lifetime access)

| Context | Menu items | Arrow | Layout |
|--------|------------|-------|--------|
| **Lifetime on trial waiting room** | Menu bar hidden (Exit course mode) | — | — |
| **Lifetime elsewhere** | Music, Sanctuary, Anua, Notes, Tribe, Gallery | Yes | Horizontal or vertical (by route) |

---

## 3. Vertical (left wall) vs horizontal (bottom)

**Vertical layout** (left wall) on these routes:

- `/(chakras)/[chakra]` (chakra day)
- `SoundBath`, `AudioLibrary`, `HeadToHeart`, `Chakras101`, `DivineLaws`, `AccountabilityOfAwakening`, `GalleryOfGnosis`

**Horizontal layout** (bottom) on all other routes where the menu bar is visible.

Same menu items in both layouts; only placement and arrow position change.

---

## 4. Page-by-page summary (menu bar visible or hidden)

| Page / route | Trial (App1) | Lifetime (App2) |
|--------------|--------------|-----------------|
| Index (stillness) | Hidden | Hidden |
| WelcomeScreen | Hidden | Hidden |
| DateSelection | Hidden | Hidden |
| **ChakraHome** (7 balls or waiting room) | **Visible:** Waiting room → 4 items, no arrow. Main home → Sanctuary, Anua, Notes, Tribe + arrow | **Visible** on main home (6 items + arrow). **Hidden** on trial waiting room (Exit course mode) |
| ChakraHub | Visible: Sanctuary, Anua, Notes, Tribe + arrow | Visible: Music, Sanctuary, Anua, Notes, Tribe, Gallery + arrow |
| [chakra] (day screen) | Visible: 4 items + arrow (vertical) | Visible: 6 items + arrow (vertical) |
| SoundBath, AudioLibrary, HeadToHeart, Chakras101, DivineLaws, AccountabilityOfAwakening, GalleryOfGnosis | Visible: 4 items + arrow (vertical) | Visible: 6 items + arrow (vertical) |
| CoursePreview, Profile, ProfileMenu, Contribute | Visible: 4 items + arrow | Visible: 6 items + arrow |
| CommitmentGate, Paywall, DevPaywall, EnergyExchange | Hidden | Hidden |
| TribeChat, AudioPlayer, CommunityHalls, NotesAlongTheWay, AnuaChat, GiftChakra | Hidden | Hidden |

---

## 5. Button actions (summary)

- **Trial waiting room:** Preview → `waitingRoomActions.onPreviewPress`, Chakras 101 → `onChakras101Press`, Anua → Sanctuary modal / open Anua, Notes → `NotesAlongTheWay?contextDay=…`
- **Trial (not waiting):** Sanctuary → SocialSanctuaryModal, Anua → same, Notes → NotesAlongTheWay, Tribe → `/(chakras)/TribeChat`
- **Lifetime:** Music → `/(chakras)/AudioLibrary`, Sanctuary → CommunityHalls modal, Anua / Notes / Tribe → same as trial, Gallery → `/(chakras)/GalleryOfGnosis`

---

## 6. Conclusion

- **App1 (trial):** Waiting room shows only Preview, Chakras 101, Anua, Notes (no arrow). Everywhere else shows Sanctuary, Anua, Notes, Tribe + arrow.
- **App2 (lifetime):** Full bar (Music, Sanctuary, Anua, Notes, Tribe, Gallery) + arrow everywhere except trial waiting room (menu bar hidden) and the hidden routes above.
- **Bug fixed:** Menu bar now shows on ChakraHome and waiting room; it was previously hidden due to `isWelcomeScreen` including ChakraHome via `isRootChakrasRoute`.
