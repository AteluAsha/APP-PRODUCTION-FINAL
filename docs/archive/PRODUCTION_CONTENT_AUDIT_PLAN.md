# Production Content Audit Plan

**Created:** February 1, 2026  
**Purpose:** Global audit of placeholders, missing content, and items needing hero content for final production.

---

## Executive Summary

This audit identified **all content gaps** across the app. The user’s known gaps (14 audio files) are correct. Several additional placeholders, unimplemented features, and backend TODOs were also found.

---

## 1. AUDIO FILES – CONFIRMED MISSING (14 files)

### 1a. Ancestral Knowledge (Head to Heart) Audio – 7 files missing

**Location:** `HeadToHeart` screen → `content.headtoheart.audio` for each chakra  
**Current State:** All 7 chakras use placeholder values:

- `source: 0` (invalid – would crash on play)
- `duration: 0`
- Title: `"THE POWER OF CREATION"`
- Author: `"ERIN"`

**Files to create:**
| Day | Chakra | Expected Content |
|-----|--------------|-------------------------------|
| 1 | Root | Ancestral Knowledge audio |
| 2 | Sacral | Ancestral Knowledge audio |
| 3 | Solar Plexus | Ancestral Knowledge audio |
| 4 | Heart | Ancestral Knowledge audio |
| 5 | Throat | Ancestral Knowledge audio |
| 6 | Third Eye | Ancestral Knowledge audio |
| 7 | Crown | Ancestral Knowledge audio |

**Implementation:** `constants/chakras/content.tsx` → `headtoheart.audio` for each chakra. Either add Firebase paths (like embodiment audio) or use local `require()` once files exist.

---

### 1b. End-of-Day Integration (audioOutro) – 7 files missing

**Location:** `ChakraTemplate` → `AudioRow` uses `content.audioOutro`  
**Current State:** All 7 chakras use:

- `source: require("@/assets/audio/root-ethan-1.mp3")` (Root file used for every chakra)
- Title varies (e.g. "Connected To The Earth", "Connected To The Body", "Connected To The Sun")

**Files to create:** Chakra-specific integration/closure audio for each day, e.g.:

| Day | Chakra       | Current Title          | Needs              |
| --- | ------------ | ---------------------- | ------------------ |
| 1   | Root         | Connected To The Earth | Root-specific      |
| 2   | Sacral       | Connected To The Body  | Sacral-specific    |
| 3   | Solar Plexus | Connected To The Sun   | Solar-specific     |
| 4   | Heart        | Connected To The Earth | Heart-specific     |
| 5   | Throat       | Connected To The Earth | Throat-specific    |
| 6   | Third Eye    | Connected To The Earth | Third Eye-specific |
| 7   | Crown        | Connected To The Earth | Crown-specific     |

**Note:** `root-erin-1.mp3` and `root-ethan-1.mp3` are preloaded in `_layout.tsx` as placeholders; replace with real files per chakra when ready.

---

## 2. AUDIO – ALREADY CONNECTED (OK)

| Audio Type         | Source                                                            | Status    |
| ------------------ | ----------------------------------------------------------------- | --------- |
| Master Embodiment  | Firebase `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days` | Connected |
| Tuning Fork        | Firebase `TuningForkAudio`                                        | Connected |
| Crystal Bowl (1hr) | Firebase `crystal_Bowl_Meditation_Audio`                          | Connected |

`content.tsx` still references local `day1tuningfork.mp3` and `day1singingbowl.mp3` in `soundBath`; Sound Bath pages use `useTuningForkAudio` and `useCrystalBowlAudio` hooks (Firebase). The local files are fallbacks and may be unused.

---

## 3. OTHER PLACEHOLDERS AND TODOS

### 3a. App Store / Sharing URLs

| File                                        | Issue                                             |
| ------------------------------------------- | ------------------------------------------------- |
| `constants/sharing.ts`                      | `APP_STORE_URLS` – placeholder URLs until publish |
| `utils/invite.ts`                           | Referral link placeholder                         |
| `components/charing/VideoRecorderModal.tsx` | App store links are placeholders                  |

**Action:** Update when app is live.

---

### 3b. Features with TODO / Placeholder Logic

| Location                                             | Issue                                                   |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `components/social/ReflectionDiaryModal.tsx`         | `TODO: Implement reflection diary content`              |
| `components/sharing/ShareAppModal.tsx`               | `TODO: Implement sharing functionality`                 |
| `components/chakras/DonationModal.tsx`               | `TODO: Implement donation processing when ready`        |
| `app/(chakras)/Donate.tsx`                           | Same donation TODO                                      |
| `components/social/CommunityFeaturePreviewModal.tsx` | `Coming Soon Notice` (if it exists)                     |
| `app/(chakras)/EnergyExchange.tsx`                   | `TODO: Open app store review page` / `TODO: Open email` |

---

### 3c. Backend / Services TODOs

| Service                           | Issue                                                           |
| --------------------------------- | --------------------------------------------------------------- |
| `src/services/stripe.ts`          | `TODO: Implement Stripe payment verification`                   |
| `src/services/profileService.ts`  | `TODO: Implement Firestore profile fetching` / `update`         |
| `src/services/socialSanctuary.ts` | Placeholder reaction system, `TODO: Implement reaction system`  |
| `src/services/revenuecat.ts`      | `TODO: Re-enable when App Store Connect configuration is ready` |

---

## 4. COMMUNITY / PLACEHOLDER CONTENT

| Item                       | Notes                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `communityPlaceholders.ts` | Uses placeholder reflections when halls are empty (dev mode). Verify if this is acceptable for production. |
| `populatePlaceholders()`   | Called from `_layout.tsx` and `CommunityHallsScreen` – may be dev-only.                                    |

---

## 5. CHECKLIST FOR FINAL PRODUCTION

### Audio (Critical)

- [ ] **Ancestral Knowledge audio** – 7 files for Head to Heart
- [ ] **End-of-day integration audio** – 7 chakra-specific files
- [ ] Replace `root-erin-1.mp3` / `root-ethan-1.mp3` placeholders in `audioIntro`/`audioOutro` once real files exist

### UI / Content

- [ ] Decide: hide or gate Head to Heart audio button until real files exist (currently `source: 0` will crash on play)
- [ ] Reflection Diary modal – implement or remove
- [ ] Share App modal – implement sharing or document limitation
- [ ] Donation flow – implement or keep disabled

### Backend / Config

- [ ] App store URLs – update when published
- [ ] Stripe verification – implement if needed
- [ ] Profile service – implement if needed
- [ ] RevenueCat – re-enable when App Store Connect is ready

---

## 6. PRIORITY ORDER

1. **P0 – Blocking:**
   - Ancestral Knowledge audio (7) – gate or fix Head to Heart play; avoid crash from `source: 0`
   - End-of-day integration audio (7) – replace Root placeholders

2. **P1 – Important:**
   - App store URLs before launch
   - Donation/Stripe if donations are part of launch

3. **P2 – Post-launch:**
   - Reflection Diary content
   - Share functionality
   - Profile service
   - Community reaction system

---

## 7. HEAD TO HEART – IMMEDIATE FIX

Until Ancestral Knowledge audio exists, the Head to Heart screen will crash when the user presses the audio row because `source: 0` is not a valid `AVPlaybackSource`.

**Options:**

1. **Hide the audio row** until real files exist.
2. **Show “Coming soon”** and disable the button.
3. **Use a safe fallback** (e.g. `root-erin-1.mp3`) for now, with a note that it’s temporary.

Recommendation: Option 2 – show “Coming soon” and disable the play action to avoid crashes and set expectations.
