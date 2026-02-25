# Anua Waiting Room - Educational & Trial-Focused Mode

## Overview

Anua's chat from the waiting room is now **more informative, educational, and trial-focused**. She covers all chakras and asks insightful questions about the user's preparation, knowledge, and intentions.

## Changes Made

### 1. ✅ Added `isWaitingRoom` Prop

- `AnuaChatModal` now accepts `isWaitingRoom?: boolean`
- When `true`, Anua enters educational mode
- `WaitingScreen` passes `isWaitingRoom={true}`

### 2. ✅ Enhanced Initial Greeting (Waiting Room)

**Before**: Simple wise question

**After**: Informative, educational greeting that:

- Introduces the 7-day chakra journey
- Explains the 7 chakras (root to crown)
- Asks about:
  - How they feel as they prepare
  - What they know about chakras
  - Experience with meditation and breathing work
  - Understanding of ego and awareness
  - Connection to their soul
  - Intentions for the journey

**Example Greetings** (randomly selected):

1. "Hello, beautiful soul. I'm Anua, your guide for this 7-day chakra journey. I'm here to help you prepare and explore before your journey begins. The 7 chakras are energy centers that run from your root to your crown, each holding unique wisdom and healing. As you wait, I'd love to understand where you are on this path. How are you feeling as you prepare for this journey? What do you already know about the chakras, and what draws you to explore them?"

2. "Hello, beautiful soul. I'm Anua, your guide. You're about to embark on a profound 7-day journey through your energy body—from your root foundation to your crown connection. Before we begin, I'd love to learn about you. How familiar are you with meditation and breathing work? Have you explored your energy body before? What intentions are you bringing to this journey?"

3. "Hello, beautiful soul. I'm Anua. You're preparing for a sacred journey through all 7 chakras—each one a gateway to deeper awareness and healing. I'm here to help you prepare. Tell me: What do you know about the relationship between ego and awareness? How do you experience your soul's presence in your daily life? What draws you to this work?"

### 3. ✅ Updated Context for Waiting Room

When `isWaitingRoom={true}`, Anua receives special context:

- **Focus Areas**:
  - All 7 chakras (root, sacral, solar plexus, heart, throat, third eye, crown)
  - Energy body and energy centers
  - Meditation and breathing practices
  - Ego and awareness
  - Soul connection and spiritual growth
  - Intentions and preparation for the journey

- **Guidance**:
  - Be very informative and educational about ALL 7 chakras
  - Help understand the energy body and how chakras work
  - Ask insightful questions about their preparation
  - Share wisdom about all chakras
  - Be trial-focused: help them prepare
  - Be insightful: help them explore their current state

### 4. ✅ Updated `askAnua` Function

- Added `isWaitingRoom?: boolean` to `currentChakraContext`
- Added `focusAreas?: string[]` to `currentChakraContext`
- Special prompt building for waiting room mode
- Different guidance than regular chakra-day-focused mode

## Result

### Waiting Room Mode:

- ✅ More informative and educational
- ✅ Covers all 7 chakras (not just one)
- ✅ Very insightful
- ✅ Asks about:
  - How they feel
  - What they know about chakras
  - Energy body
  - Intentions
  - Meditation
  - Breathing work
  - Ego and awareness
  - Souls

### Regular Mode (during journey):

- ✅ Focused on current chakra day
- ✅ Brings everything back to the "now moment"
- ✅ Guides them through their current day's work

## Code Locations

1. **`components/social/AnuaChatModal.tsx`**:
   - Added `isWaitingRoom` prop
   - Enhanced greeting logic (lines 87-140)
   - Updated context passing (lines 161-180)

2. **`components/chakras/WaitingScreen.tsx`**:
   - Passes `isWaitingRoom={true}` to `AnuaChatModal` (line 301)

3. **`src/services/gemini.ts`**:
   - Updated `currentChakraContext` type (lines 561-566)
   - Added waiting room prompt building (lines 584-620)

## Testing

1. Open Anua chat from waiting room
2. Verify greeting is informative and educational
3. Verify Anua asks about:
   - How they feel
   - What they know about chakras
   - Meditation/breathing experience
   - Ego and awareness
   - Soul connection
   - Intentions
4. Verify Anua discusses all 7 chakras
5. Verify responses are insightful and educational
