# Back Arrow Audit Log – Post-Rebuild

## Summary

All back arrows have been rebuilt to: **white arrow only, no background, standalone**. No grey circles.

---

## Screens with Back Arrows (Complete Inventory)

### App1 & App2 Chakra Flow

| Screen                        | Component            | Back Arrow                 | Navigation                                    | Status                    |
| ----------------------------- | -------------------- | -------------------------- | --------------------------------------------- | ------------------------- |
| **[chakra] (ChakraTemplate)** | ActionBarAnimated    | ✅ Custom (screen content) | `router.back()`                               | Fixed – was grey circle   |
| **Chakras101**                | ActionBarAnimated    | ✅ Custom (screen content) | `onBackPress` → ChakraHome or `router.back()` | Fixed – was grey circle   |
| **HeadToHeart**               | ActionBarAnimated    | ✅ Custom (screen content) | `router.back()`                               | Fixed – was grey circle   |
| **ChakraHub**                 | ActionBar            | ✅                         | `router.back()`                               | OK (no circle)            |
| **ChakraHome**                | (hub – no back)      | N/A                        | Entry from index                              | N/A                       |
| **DateSelection**             | Custom Pressable     | ✅                         | `router.back()`                               | OK (transparent)          |
| **WaitingScreen**             | Custom Pressable     | ✅                         | `handleBackToDateSelection`                   | Fixed – removed bg        |
| **PreviewJourney**            | Custom Pressable     | ✅                         | `onBackPress` (prop)                          | OK (transparent)          |
| **CoursePreview**             | Custom Pressable     | ✅                         | `router.back()`                               | Fixed – removed bg/border |
| **QuizScreen**                | Custom Pressable (2) | ✅                         | `router.back()`                               | Fixed – removed bg        |

### Other Screens

| Screen                        | Component     | Back Arrow      | Navigation             | Status |
| ----------------------------- | ------------- | --------------- | ---------------------- | ------ |
| **SoundBath**                 | ActionBar     | ✅              | `router.back()`        | OK     |
| **AudioLibrary**              | ActionBar     | ✅              | `router.back()`        | OK     |
| **EnergyExchange**            | ActionBar     | ✅              | `onBackPress` (custom) | OK     |
| **AccountabilityOfAwakening** | ActionBar     | ✅              | `router.back()`        | OK     |
| **GalleryOfGnosis**           | ActionBar     | ✅              | `router.back()`        | OK     |
| **NotesAlongTheWay**          | ActionBar     | ✅              | `router.back()`        | OK     |
| **Donate**                    | ActionBar     | ✅              | `router.back()`        | OK     |
| **AudioPlayer**               | ActionBar (X) | Close, not back | `router.back()`        | OK     |
| **ChakraCardRevealModal**     | ActionBar (X) | Close, not back | `onXPress`             | OK     |

### Modal / Nested Context

| Screen                   | Component        | Back Arrow        | Navigation      | Notes                  |
| ------------------------ | ---------------- | ----------------- | --------------- | ---------------------- |
| **CommunityHallsScreen** | Custom Pressable | ✅                | `router.back()` | Earth-toned header bar |
| **SocialSanctuaryModal** | Custom Pressable | "Back to Options" | In-modal nav    | Different use case     |

---

## Missing Back Arrows

**None.** All screens that should have back navigation have it.

---

## Design Spec (Applied)

- **Icon:** `Ionicons` `arrow-back`, size 24
- **Color:** White (`#FFFFFF` or `rgba(255,255,255,0.9)`)
- **Background:** `transparent` (no circles, no pills)
- **Border:** None
- **Position:** Top-left, safe area aware

---

## Navigation Verification

- **ChakraTemplate** → ChakraHome (App1) or ChakraHub (App2)
- **Chakras101** → ChakraHome when in waiting room; `router.back()` otherwise
- **HeadToHeart** → Previous screen
- **EnergyExchange** → ChakraHome or ChakraHub (via `onBackPress`)
- **DateSelection** → ChakraHome or previous
- **WaitingScreen** → DateSelection
- **PreviewJourney** → WaitingScreen (via `onBackPress`)
- **CoursePreview** → Previous screen
- **QuizScreen** → Chakra day page
- **All ActionBar screens** → `router.back()` (previous in stack)
