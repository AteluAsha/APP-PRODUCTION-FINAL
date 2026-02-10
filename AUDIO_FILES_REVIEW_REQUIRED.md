# ⚠️ AUDIO FILES REVIEW REQUIRED - PLACEHOLDERS DETECTED

## 🚨 CRITICAL: PLACEHOLDER AUDIO FILES IN PRODUCTION

**Status:** ⚠️ **REQUIRES IMMEDIATE ATTENTION BEFORE PRODUCTION LAUNCH**

The `constants/chakras/content.tsx` file contains **placeholder audio files** that are actively used but contain incorrect content. All 7 chakras are using Root chakra audio files as placeholders.

## Critical Finding
The `constants/chakras/content.tsx` file contains **placeholder audio files** that are actively used but need to be replaced with chakra-specific files. These need to be reviewed and either:
1. Replaced with actual chakra-specific audio files
2. Removed if not needed
3. Confirmed as intentional fallback files

---

## Files Requiring Review

### 1. `root-erin-1.mp3` and `root-ethan-1.mp3`
**Location:** `constants/chakras/content.tsx`
**Usage:** Referenced in `audioIntro` and `audioOutro` for ALL 7 chakras
**Status:** ⚠️ **PLACEHOLDER DETECTED**

**Details:**
- Used in `audioIntro.source` for all chakras (lines 61, 178, 293, 409, 526, 643, 760)
- Used in `audioOutro.source` for all chakras (lines 67, 184, 299, 415, 532, 649, 766)
- **Line 643 has comment:** `// Placeholder - actual audio comes from Firebase`
- **Actual embodiment audio:** Comes from Firebase Storage via `useEmbodimentAudio` hook

**Issue:**
- ✅ **VERIFIED:** `audioOutro` IS actively used in ChakraTemplate (line 266-272)
- ✅ **VERIFIED:** `audioIntro` is used for title/duration metadata (line 244, 246)
- ❌ **CRITICAL:** All 7 chakras use Root chakra audio files (`root-erin-1.mp3`, `root-ethan-1.mp3`) as placeholders
- **This means:** Users hear Root chakra audio for ALL chakras' outro, which is incorrect

**Action Required:**
1. ⚠️ **URGENT:** Replace `root-erin-1.mp3` and `root-ethan-1.mp3` with chakra-specific audio files for all 7 chakras
2. OR: Remove `audioOutro` section if not needed
3. OR: Document as intentional (if all chakras should use same outro)

---

### 2. `396.mp3`
**Location:** `assets/audio/`
**Usage:** ⚠️ **NOT FOUND IN CODE**
**Status:** ⚠️ **UNUSED FILE**

**Action Required:**
- Remove if not needed
- Or document if it's a backup/legacy file

---

## Files Confirmed IN USE ✅

### `day1singingbowl.mp3` ✅
- **Used in:** `constants/chakras/content.tsx` → `soundBath.soundBowlAudio`
- **Used by:** `app/(chakras)/SoundBath.tsx` → "SOUND BATH" button
- **Status:** ✅ **ACTIVELY USED** - Keep

### `day1tuningfork.mp3` ✅
- **Used in:** `constants/chakras/content.tsx` → `soundBath.tuningForkAudio`
- **Note:** SoundBath uses Firebase `useTuningForkAudio` hook, but this file is referenced
- **Status:** ⚠️ **May be fallback** - Verify if Firebase hook is primary

---

## Recommendation

### High Priority
1. **Verify `audioIntro` and `audioOutro` usage:**
   - Check if ChakraTemplate actually uses these
   - If not used: Remove from content.tsx
   - If used: Replace placeholders with actual audio files

2. **Remove unused files:**
   - `396.mp3` - Not found in code, safe to remove

### Medium Priority
1. **Document audio file strategy:**
   - Clarify which files are primary (Firebase) vs fallback (local)
   - Update content.tsx comments to reflect actual usage

---

## Next Steps
1. ✅ Verify `audioIntro`/`audioOutro` usage in ChakraTemplate
2. ⚠️ Replace placeholders with actual audio OR remove if not used
3. ⚠️ Remove `396.mp3` if confirmed unused
4. ⚠️ Document audio file strategy

**Status:** ⚠️ **REQUIRES REVIEW BEFORE PRODUCTION**
