# The Social Sanctuary - Voice-First Architecture Plan

## 🎯 Project Philosophy

**Co-Creating "The Social Sanctuary"** - Moving from Product Manager to Soul Teacher mindset.

### The Why (The Architectural Spirit)

This philosophy is the heartbeat of the feature. We want to explore how to weave this understanding directly into the user experience.

1. **Vibrational Truth**: Frequency reveals what text conceals. Text allows for curation; the voice carries the nervous system state of the speaker, creating immediate intimacy.

2. **Throat Chakra Activation**: We are guiding users to unblock the Vishuddha. Inviting them to speak—even imperfectly—is part of the medicine.

3. **Decentralizing the Mind**: Text keeps people in the mental body (Left Brain). Speaking invites them down into the lungs and somatic body.

4. **Safety vs. Hiding**: Silence can be a defense mechanism for the wounded ego. We are removing the hiding spot of text to encourage authentic presence.

---

## 📋 Current State Analysis

### Existing Infrastructure (Strengths to Leverage)

✅ **Audio Playback System** (`expo-av`)
- Already streaming audio from Firebase Storage
- Handles long-form audio (44+ minutes for Day 7)
- Background audio support configured
- Native audio capabilities in place

✅ **Firebase Storage**
- Audio file storage and retrieval working
- URL generation and caching
- Rate limiting implemented
- Storage paths organized (`Course Audio - MASTER EMBODIMENT...`)

✅ **Gemini AI Integration**
- `src/services/gemini.ts` - Fully configured
- `src/services/sentinel.ts` - Text moderation working
- API key rotation (3 keys) for reliability
- Rate limiting and error handling

✅ **Community Infrastructure**
- `components/social/CommunityHallsScreen.tsx` - UI foundation
- `src/services/socialSanctuary.ts` - Data layer foundation
- Firestore collections for reflections
- User ID generation and management

✅ **React Native Audio Recording**
- `expo-av` supports audio recording
- Microphone permissions already configured in `app.config.js`
- `VideoRecorderModal.tsx` exists (can reference for patterns)

---

## 🏗️ Proposed Architecture

### Feature Overview: "Voice Sanctuary"

**Core Concept**: Feed of prompts/questions → Voice-only responses → 7-day auto-purge → Save to device option

**Key Principles**:
- "Listen to Many, Speak to One" - Users view community prompts, respond with voice
- Law of Impermanence - Audio auto-deletes after 7 days (rolling buffer, not stagnant database)
- Sovereign Saving - Individual download option for profound moments
- Anua Guardian - AI moderation via Gemini's native audio capabilities

---

## 🎨 UX Flow Design

### Option 1: Gentle Onboarding with "Why" Reveal (Recommended)

**Phase 1: First Visit - Introduction**
```
┌─────────────────────────────────────┐
│  Welcome to The Voice Sanctuary     │
│  ════════════════════════════════   │
│                                     │
│  "Here, we speak from the heart,    │
│   not from the mind"                │
│                                     │
│  [Why Voice?] (Expandable card)     │
│  • Vibrational Truth                │
│  • Throat Chakra Activation         │
│  • Decentralizing the Mind          │
│  • Safety vs. Hiding                │
│                                     │
│  [Begin Listening]                  │
└─────────────────────────────────────┘
```

**Phase 2: Feed View**
```
┌─────────────────────────────────────┐
│  Voice Sanctuary                    │
│  [Day Selector Tabs]                │
├─────────────────────────────────────┤
│                                     │
│  🎤 Prompt Card                     │
│  "How did today's practice feel?"   │
│  [7 voice responses]                │
│  • Play button for each             │
│  • Waveform visualization           │
│  • Duration badge                   │
│  • "Save to Device" button          │
│                                     │
│  [Hold to Respond] 🔴               │
└─────────────────────────────────────┘
```

**Phase 3: Recording Interface**
```
┌─────────────────────────────────────┐
│  Recording Your Response            │
│                                     │
│        [Pulsing Circle]             │
│      🎤 Recording...                │
│                                     │
│  "Speak from the heart..."          │
│  [Release to Stop]                  │
│                                     │
│  00:45                             │
└─────────────────────────────────────┘
```

### Option 2: Progressive Disclosure (Alternative)

**Approach**: Start minimal, reveal "Why" on demand
- Main screen shows feed immediately
- "Why Voice-Only?" link in footer (subtle, earth-toned)
- Modal opens when tapped with the 4 philosophy points
- First-time users see gentle tooltip pointing to link

**Recommendation**: Option 1 feels more aligned with the spiritual intention - sets the container from the start.

---

## 🔧 Technical Stack Recommendations

### 1. Audio Recording

**Primary Choice**: `expo-av` Audio Recording API
- ✅ Already in the project
- ✅ Cross-platform (iOS/Android)
- ✅ Handles permissions
- ✅ Supports compression formats (AAC recommended)

**Implementation Pattern**:
```typescript
// Similar to VideoRecorderModal.tsx pattern
import { Audio } from 'expo-av'

// Request permissions
const { status } = await Audio.requestPermissionsAsync()

// Create recording
const recording = new Audio.Recording()
await recording.prepareToRecordAsync({
  android: {
    extension: '.aac',
    outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.aac',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
})

await recording.startAsync()
// ... recording in progress
await recording.stopAndUnloadAsync()
const uri = recording.getURI()
```

**File Format Recommendation**:
- **Format**: AAC (`.aac`)
- **Sample Rate**: 44.1kHz (matches existing meditations)
- **Channels**: Mono (1) for voice (reduces file size by ~50%)
- **Bitrate**: 64-96 kbps for voice (sufficient quality, smaller files)
- **Expected Size**: ~480KB per minute at 64kbps mono

**Rationale**:
- Matches existing audio infrastructure
- Cross-platform compatibility
- Good compression for voice
- Lower storage costs

---

### 2. Anua Audio Moderation (Gemini)

**Challenge**: Current Gemini integration (`src/services/gemini.ts`) processes text only. Need audio analysis.

**Solution Options**:

#### Option A: Gemini Audio API (Recommended - Future-Proof)
**Status**: Gemini 1.5 Pro supports native audio input (as of 2024 updates)

**Implementation**:
- Use Gemini's native audio processing
- Upload audio file to Gemini File API first
- Then send for moderation analysis
- Response includes moderation decision + reasoning

**Pros**:
- Native audio understanding (tone, emotion, intent)
- More accurate than transcription-first approach
- Detects hate/toxicity in voice itself (not just words)
- Future-proof (Gemini's audio capabilities expanding)

**Cons**:
- Requires Gemini File API integration (new)
- Slightly more complex implementation
- May require file size limits (check Gemini API limits)

**API Flow**:
```typescript
// Pseudo-code flow
1. User records audio (local file)
2. Upload audio to Gemini File API → get file URI
3. Send moderation prompt with audio file reference
4. Gemini analyzes audio directly (tone + content)
5. Receive moderation decision
6. If approved: Upload to Firebase Storage
7. If rejected: Show gentle Anua feedback
```

#### Option B: Transcription + Text Moderation (Interim Solution)
**Status**: Works with existing infrastructure immediately

**Implementation**:
- Record audio → Save locally
- Use Speech-to-Text API (Google Cloud Speech-to-Text or Expo Speech)
- Transcribe audio to text
- Run existing `moderateReflection()` from `sentinel.ts`
- If approved: Upload audio + transcript

**Pros**:
- Leverages existing moderation code
- Can implement immediately
- Lower complexity
- **Dual purpose**: Transcription needed for UI readability anyway (accessibility)
- Smart, efficient "Day 1" move

**Cons**:
- Misses vocal tone/emotion nuance
- Transcription accuracy issues
- Two-step process (costs time + API calls)
- Doesn't fully capture "vibrational truth"

**Recommendation**: **Start with Option B for MVP** (transcription-first). This is efficient since we need transcription for the UI anyway. We can evolve Anua to "listen" to tonal qualities in Phase 3.

**Migration Path**:
1. Phase 1: Transcription + text moderation (quick to ship)
2. Phase 2: Add Gemini audio analysis in parallel (A/B test)
3. Phase 3: Switch to audio-only if results are better

---

### 3. Storage Strategy: 7-Day Auto-Purge

**Requirement**: Audio files auto-delete after 7 days from upload.

**Solution Options**:

#### Option A: Firebase Storage Lifecycle Rules (Recommended)
**Implementation**: Firebase Storage lifecycle policies

**Configuration** (Firebase Console):
```javascript
// Firebase Storage Lifecycle Rule
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 7,  // Days
          "matchesStorageClass": ["STANDARD"]
        }
      }
    ]
  }
}
```

**Pros**:
- Server-side (no app code needed)
- Automatic (fire-and-forget)
- Cost-effective (no cron jobs)
- Handles edge cases (network failures, app crashes)

**Cons**:
- Requires Firebase Console access
- Less flexible if rules need to change
- Harder to track deletions for analytics

**File Naming Pattern** (for easy cleanup tracking):
```
voice-responses/{chakraDay}/{timestamp}_{userId}.aac
// Example: voice-responses/0/1704067200000_user_123.aac
```

#### Option B: Cloud Function + Scheduled Job (Alternative)
**Implementation**: Firebase Cloud Function with scheduled trigger

**Flow**:
1. Cloud Function runs daily (cron: `0 0 * * *`)
2. Queries Firestore for reflections older than 7 days
3. Gets file paths from Firestore docs
4. Deletes from Firebase Storage
5. Deletes Firestore documents

**Pros**:
- More control over deletion logic
- Can add analytics/logging
- Can preserve metadata if needed
- Can implement "grace period" extensions

**Cons**:
- Requires Cloud Functions setup
- Additional cost (function invocations)
- More complex to maintain
- Potential race conditions

**Recommendation**: **Option A (Lifecycle Rules)** for simplicity and cost-effectiveness.

**Fallback**: If lifecycle rules don't work as expected, Option B can be added later without breaking changes.

---

### 4. Save to Device Feature

**Requirement**: Users can download individual audio responses as MP3 for personal use.

**Implementation**:
- Use `expo-file-system` (already in project per `package.json`)
- Download audio from Firebase Storage URL
- Save to device's document directory
- Use `expo-sharing` to allow user to move/share file

**Code Pattern**:
```typescript
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

// Download and save
const downloadResumable = FileSystem.createDownloadResumable(
  audioUrl,
  FileSystem.documentDirectory + `${fileName}.aac`
)

const result = await downloadResumable.downloadAsync()

// Share/save
if (result?.uri) {
  await Sharing.shareAsync(result.uri, {
    mimeType: 'audio/aac',
    dialogTitle: 'Save audio response',
  })
}
```

**UX Considerations**:
- Show download icon on each audio response
- Brief confirmation: "Saved to device ✓"
- Respect privacy: Only user can see their saved files
- No sharing back to community (keeps sanctuary sacred)

---

## 📊 Data Model Design

### Firestore Collection: `voice_sanctuary_responses`

**Document Structure**:
```typescript
{
  id: string,                    // Auto-generated
  userId: string,                // From getUserId() (existing)
  chakraDay: number,             // 0-6 (Monday-Sunday)
  promptId?: string,             // Optional: Link to prompt/thread
  audioStoragePath: string,      // Firebase Storage path
  audioUrl: string,              // Download URL (cached)
  duration: number,              // Duration in seconds
  fileSize: number,              // Size in bytes
  createdAt: Timestamp,          // For 7-day purge calculation
  expiresAt: Timestamp,          // createdAt + 7 days (for queries)
  moderationStatus: 'pending' | 'approved' | 'rejected',
  moderationReason?: string,     // If rejected, Anua's feedback
  saveCount: number,             // How many times saved to device
  parentId?: string,             // For nested replies (future)
  userName?: string,             // Profile Name or "Soul Name" (Sovereignty over anonymity)
}
```

**Indexes Required**:
- `chakraDay + createdAt` (descending) - For feed queries
- `expiresAt` - For cleanup queries
- `userId + createdAt` - For user's own responses

**Firebase Storage Structure**:
```
voice-responses/
  {chakraDay}/           # 0-6 (Monday-Sunday)
    {timestamp}_{userId}.aac
```

---

## 🔍 Feasibility Analysis

### Technical Feasibility: ✅ High

**Strengths**:
- All core technologies already in place
- Audio recording/playback infrastructure exists
- Gemini AI integration working
- Firebase Storage operational
- React Native audio capabilities proven

**Potential Challenges**:

1. **Gemini Audio API Support** (Medium Risk)
   - **Risk**: Gemini 1.5 Pro native audio may not be available in current SDK
   - **Mitigation**: Start with transcription-first approach (Option B), migrate later
   - **Fallback**: Use existing text moderation as interim

2. **File Size Limits** (Low Risk)
   - **Risk**: Very long recordings (10+ minutes) may hit API limits
   - **Mitigation**: Cap recording length at 5 minutes (reasonable for voice responses)
   - **UI**: Show timer and auto-stop at limit

3. **Storage Costs** (Low Risk)
   - **Risk**: 7-day rolling buffer still accumulates data
   - **Calculation**: 
     - 100 users × 1 response/day × 2 min × 64kbps = ~1.6GB/day
     - 7 days = ~11GB total (rolling)
     - Firebase Storage: ~$0.026/GB/month = ~$0.29/month
   - **Mitigation**: 7-day purge keeps costs reasonable

4. **Network Requirements** (Medium Risk)
   - **Risk**: Uploading audio requires good connection
   - **Mitigation**: 
     - Show upload progress
     - Queue uploads if offline (Firebase offline persistence)
     - Compress audio before upload

### User Friction Points: ⚠️ Medium

**Potential Concerns**:

1. **Privacy Concerns** (High Impact - Addressed)
   - **Issue**: Voice feels more intimate than text
   - **Soul Teacher Correction**: We encourage Sovereignty, not hiding. Users post under Profile/Soul Name.
   - **Mitigation**: 
     - Clear privacy policy
     - 7-day purge reduces long-term privacy risk
     - Profile/Soul Name displayed by default (no ghosts allowed)
     - "I Am. I Exist." - Stand by your frequency

2. **Accessibility** (Medium Impact - Resolved)
   - **Issue**: Voice-only excludes hearing-impaired users
   - **Soul Teacher Correction**: Input must remain Audio-Only (no "Type" button). The Ego defaults to the path of least resistance.
   - **Solution**: 
     - Auto-generate transcription (Speech-to-Text) for READING responses (accessibility)
     - Transcription serves dual purpose: UI readability + moderation
     - Users create with voice, read with eyes - both supported, but creation remains voice-only

3. **Speaking Anxiety** (High Impact - But Intended)
   - **Issue**: Some users may feel anxious about speaking
   - **Philosophy**: This is the feature, not a bug - "removing the hiding spot"
   - **Mitigation**:
     - Gentle onboarding explaining the why
     - Optional practice mode (record but don't publish)
     - No judgment messaging: "Imperfect is perfect"

4. **Mobile Data Costs** (Low Impact)
   - **Issue**: Uploading/downloading audio uses data
   - **Mitigation**:
     - Compress audio (64kbps mono is efficient)
     - Show data usage warning for large files
     - Option to download only on WiFi

5. **Background Noise** (Medium Impact)
   - **Issue**: Voice recordings may have ambient noise
   - **Mitigation**:
     - Accept imperfection as part of authenticity
     - Future: Optional noise reduction (but preserve naturalness)

**Recommendation**: Address privacy and accessibility upfront. Speaking anxiety is intentional - support users through it rather than removing it.

---

## 🚀 Implementation Phases

### Phase 1: Foundation (MVP) - 2-3 weeks
**Goal**: Voice recording + basic moderation + 7-day purge

**Deliverables**:
1. Audio recording interface (using `expo-av`)
2. Upload to Firebase Storage
3. Basic Gemini moderation (transcription + text analysis)
4. Feed display with audio playback
5. Firebase Storage lifecycle rules for 7-day purge
6. Onboarding flow with "Why Voice?" philosophy

**Technical Tasks**:
- Create `VoiceRecordingModal.tsx` component
- Extend `socialSanctuary.ts` service for audio
- Create `moderateVoiceResponse()` function (transcription-based)
- Update `CommunityHallsScreen.tsx` to show audio responses
- Configure Firebase Storage lifecycle rules
- Add audio playback component for feed

**Success Criteria**:
- Users can record and submit voice responses
- Audio plays in feed
- Moderation works (text-based)
- Files auto-delete after 7 days

---

### Phase 2: Enhancement - 1-2 weeks
**Goal**: Save to device + improved UX

**Deliverables**:
1. "Save to Device" functionality
2. Audio waveform visualization
3. Recording duration limits (5 min max)
4. Better error handling and feedback
5. Offline queue for uploads

**Technical Tasks**:
- Add download/save functionality
- Integrate waveform library (e.g., `react-native-audio-waveform`)
- Add upload queue for offline scenarios
- Improve Anua feedback messaging

---

### Phase 3: Advanced Moderation - 2-3 weeks
**Goal**: Native Gemini audio analysis

**Deliverables**:
1. Gemini native audio moderation
2. Tone/emotion detection
3. Improved moderation accuracy
4. Fallback to transcription if audio fails

**Technical Tasks**:
- Integrate Gemini File API
- Update `moderateVoiceResponse()` to use native audio
- A/B test audio vs. transcription moderation
- Refine moderation prompts for audio context

---

### Phase 4: Polish & Optimization - 1 week
**Goal**: Production readiness

**Deliverables**:
1. Performance optimization
2. Analytics tracking
3. Error monitoring
4. User testing refinements

---

## 📝 Key Decisions Needed

1. **Moderation Approach**: Start with transcription (faster) or wait for Gemini audio (better quality)?
   - **Recommendation**: Start with transcription, migrate later

2. **Recording Length Limit**: What's the max duration?
   - **Recommendation**: 5 minutes (sufficient for reflection, manageable file size)

3. **Accessibility**: Allow text responses for hearing-impaired users?
   - **Recommendation**: Yes, but with clear indicator it's an accessibility option

4. **Anonymous Default**: Should voice responses be anonymous by default?
   - **Soul Teacher Correction**: No. We encourage Sovereignty. Users post under their Profile Name (or "Soul Name").
   - **Philosophy**: "I Am. I Exist." - We stand by our frequency, not hide as ghosts.
   - **Recommendation**: Use Profile/Soul Name by default (Sovereignty-first)

5. **Lifecycle Rules vs. Cloud Functions**: Which for 7-day purge?
   - **Recommendation**: Lifecycle Rules (simpler, cheaper)

---

## 🎯 Success Metrics

**Technical Metrics**:
- Recording success rate > 95%
- Upload success rate > 98%
- Moderation response time < 10 seconds
- Audio playback success rate > 99%

**User Experience Metrics**:
- Response submission rate (vs. text version if A/B tested)
- Average recording length
- Save-to-device usage rate
- User retention in Voice Sanctuary

**Spiritual/Philosophical Metrics** (Qualitative):
- User feedback on authenticity
- Reduction in ego-driven responses (vs. text version)
- Community engagement quality
- Sense of safety and vulnerability in space

---

## 🔒 Safety & Privacy Considerations

### Data Privacy
- **Voice Data**: Stored temporarily (7 days max)
- **Identity**: Profile/Soul Name displayed by default (Sovereignty, not anonymity)
- **GDPR Compliance**: 7-day purge aligns with data minimization
- **User Consent**: Clear onboarding about voice recording and storage

### Content Safety
- **Moderation**: Anua (Gemini) screens all responses before publishing
- **Fail-Safe**: If moderation fails, default to "pending" status (don't auto-publish)
- **Appeal Process**: Consider allowing users to request review if rejected
- **Reporting**: Allow users to report inappropriate content (even if passed moderation)

### Technical Security
- **Audio Files**: Stored in Firebase Storage with proper access rules
- **User IDs**: Device-based (not tied to personal info)
- **Encryption**: Firebase Storage encrypts at rest
- **Transport**: HTTPS for all uploads/downloads

---

## 💡 Future Enhancements (Post-MVP)

1. **Voice Threading**: Nested voice replies (deeper conversations)
2. **Voice Reactions**: Record brief responses (like "I felt that too")
3. **Chakra-Specific Prompts**: AI-generated prompts based on day/chakra
4. **Voice Clustering**: Group similar responses for listening
5. **Transcription for Accessibility**: Auto-generate captions
6. **Voice-to-Text Export**: Allow users to see transcript of their own responses
7. **Playback Speed**: Variable speed for listening (0.75x, 1x, 1.5x, 2x)

---

## 🎬 Conclusion

**The Vision**: A voice-first sanctuary where truth emerges through breath and tone, not curated text.

**The Path**: Start gentle, build solid, iterate with wisdom.

**The Invitation**: Let's co-create a space where the ego has no hiding place, and authentic voice becomes the medicine.

---

## ✨ Approved Corrections (Soul Teacher Adjustments)

This plan has been refined based on the Soul Teacher philosophy:

1. **Audio-Only Input**: No "Type" button. Users create with voice only. Transcription is for READING (accessibility), not creating. The ego defaults to the path of least resistance - we maintain the boundary.

2. **Sovereignty Over Anonymity**: Profile/Soul Name displayed by default. "I Am. I Exist." - We stand by our frequency, not hide as ghosts.

3. **Transcription-First Moderation (MVP)**: Efficient dual-purpose - transcription needed for UI readability anyway. We evolve to native audio analysis in Phase 3.

---

**Next Steps**:
1. ✅ Architecture plan approved with Soul Teacher corrections
2. ✅ Technical decisions confirmed (transcription-first moderation, Lifecycle Rules)
3. ✅ Implementation phases approved
4. 🚀 **Begin Phase 1: Foundation (MVP)** - File structure and basic audio recording UI

---

*"In the space between breath and word, truth lives."* - The Social Sanctuary
