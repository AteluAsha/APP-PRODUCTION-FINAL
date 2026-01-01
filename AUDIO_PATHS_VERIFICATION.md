# Audio Paths Verification - Master Embodiment Meditations

## Firebase Storage Location
**Base Path:** `gs://soul-school-367ee.firebasestorage.app/Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days`

## Day-to-Audio Mapping

### Monday (Day 0) - Root Chakra
- **Chakra Enum:** `Chakra.ROOT`
- **Audio File:** `Day1_RootChakraEmbodiment_SoulSchool.aac`
- **Full Path:** `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day1_RootChakraEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

### Tuesday (Day 1) - Sacral Chakra
- **Chakra Enum:** `Chakra.SACRAL`
- **Audio File:** `Day2_SacralChakraEmbodiment_SoulSchool.aac`
- **Full Path:** `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day2_SacralChakraEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

### Wednesday (Day 2) - Solar Plexus Chakra
- **Chakra Enum:** `Chakra.SOLAR_PLEXUS`
- **Audio File:** `Day3_SolarChakraEmbodiment_SoulSchool.aac`
- **Full Path:** `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day3_SolarChakraEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

### Thursday (Day 3) - Heart Chakra
- **Chakra Enum:** `Chakra.HEART`
- **Audio File:** `Day4_HeartChakraEmbodiment_SoulSchool.aac`
- **Full Path:** `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day4_HeartChakraEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

### Friday (Day 4) - Throat Chakra
- **Chakra Enum:** `Chakra.THROAT`
- **Audio File:** `Day5_ThroatChakraEmbodiment_SoulSchool.aac`
- **Full Path:** `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day5_ThroatChakraEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

### Saturday (Day 5) - Third Eye Chakra (Ajna)
- **Chakra Enum:** `Chakra.THIRD_EYE`
- **Audio Files (Two Parts):**
  - **Part One:** `Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac`
  - **Part Two:** `Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac`
- **Full Paths:**
  - `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day6_PARTONE_AjnaEmbodiment_SoulSchool.aac`
  - `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day6_PARTTWO_AjnaEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

### Sunday (Day 6) - Crown Chakra
- **Chakra Enum:** `Chakra.CROWN`
- **Audio File:** `Day7_CrownChakraEmbodiment_SoulSchool.aac`
- **Full Path:** `Course Audio - MASTER EMBODIMENT - 7 Chakras in 7 Days/Day7_CrownChakraEmbodiment_SoulSchool.aac`
- **Status:** ✅ Verified in code

## Code Location
- **Hook:** `hooks/useEmbodimentAudio.ts`
- **Mapping:** `CHAKRA_TO_AUDIO_FILE` constant
- **Component:** `components/chakras/ChakraTemplate.tsx`

## Debug Logging
Comprehensive debug logging has been added to:
1. `useEmbodimentAudio` hook - logs which chakra and file(s) are being fetched
2. `ChakraTemplate` component - logs which chakra is rendering and audio state

## Verification Checklist
- [x] All 7 days have correct audio file mappings
- [x] Day 6 (Third Eye) correctly handles two-part audio
- [x] Firebase Storage folder path is correct
- [x] Debug logging added for troubleshooting
- [x] Error handling includes specific file name in error messages

## Notes
- All audio files are in `.aac` format
- Files are stored in Firebase Storage, not bundled with the app
- Audio URLs are fetched dynamically when each chakra screen loads
- Rate limiting is implemented to prevent API abuse

