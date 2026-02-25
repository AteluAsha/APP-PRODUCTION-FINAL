# Gemini LIVE Functions for Anua – Implementation Plan

**Status:** Plan only. No code changes.

---

## 1. Current Architecture

### 1.1 Anua Voice Flow Today

| Step | Component                        | Role                                                    |
| ---- | -------------------------------- | ------------------------------------------------------- |
| 1    | **User input**                   | Text (typed) or voice (mic → record → send)             |
| 2    | **Gemini REST** (`gemini.ts`)    | `askAnua()` or `askAnuaWithAudio()` – text in, text out |
| 3    | **ElevenLabs** (`elevenlabs.ts`) | `speakAsAnua()` – text-to-speech for Anua’s reply       |
| 4    | **expo-av**                      | Play synthesized audio                                  |

### 1.2 Where ElevenLabs Is Used

| Location               | Use Case                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| `AnuaChatModal.tsx`    | "Hear responses" toggle – speaks Anua’s chat replies                  |
| `gemini.ts`            | Optional `enableVoice` – speaks response after `askAnua`              |
| `anuaReader.ts`        | Read text aloud (audiobook-style) with optional Heart-Mind Reflection |
| `anuaNavigation.ts`    | Speaks "I am taking you there now" when navigating                    |
| `anuaRitualService.ts` | Intro/outro rituals (Threshold, Bridge) for chakra days               |

### 1.3 Current Gemini Usage

- **Model:** `gemini-2.5-pro` (REST API)
- **Modes:** Text-only (`askAnua`) and audio-in (`askAnuaWithAudio` – Gemini transcribes)
- **Pattern:** Request → wait for full response → optionally send text to ElevenLabs

---

## 2. What Is Gemini LIVE?

Gemini LIVE is a **real-time, bidirectional** voice API:

- **WebSocket-based** – persistent connection instead of REST
- **Audio-in ↔ audio-out** – user speaks, model responds with audio directly
- **Low latency** – streaming, no “record → send → wait → play”
- **Interruption support** – user can “barge in” while Anua speaks
- **Voice activity detection (VAD)** – built-in
- **Function calling** – can trigger app actions (e.g. navigation) from voice

### 2.1 Models

- `gemini-live-2.5-flash` – Private GA
- `gemini-live-2.5-flash-preview-native-audio` – Public preview (native audio)
- `gemini-live-2.5-flash-preview` – Development

### 2.2 Connection Options

1. **Client → Live API** – Lowest latency, needs ephemeral tokens for security
2. **Client → Backend → Live API** – Backend proxies; more control, more latency

---

## 3. Impact on ElevenLabs

### 3.1 Conversation Mode (Gemini LIVE)

In **conversation mode**, Gemini LIVE returns **audio directly**. ElevenLabs is **not used** for Anua’s spoken replies in that flow.

| Scenario                | Today                               | With Gemini LIVE                             |
| ----------------------- | ----------------------------------- | -------------------------------------------- |
| Chat + "Hear responses" | Gemini text → ElevenLabs TTS        | Gemini LIVE audio stream → play              |
| Voice input (mic)       | Record → Gemini → text → ElevenLabs | Stream mic → Gemini LIVE → stream audio back |

### 3.2 Where ElevenLabs Stays

ElevenLabs should **remain** for:

| Use Case              | Reason                                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| **anuaReader**        | Reading static text (chakra content, Chakras 101, etc.) – not conversational |
| **anuaRitualService** | Intro/outro rituals – scripted, not real-time conversation                   |
| **anuaNavigation**    | "I am taking you there now" – short, scripted phrase                         |
| **Fallback**          | If Gemini LIVE is unavailable or user prefers text-only mode                 |

### 3.3 Voice Identity

- **Gemini LIVE** – Uses Google’s built-in voices; Anua’s “voice” will differ from ElevenLabs
- **ElevenLabs** – Custom `anuaVoiceId`, tuned for calm, regulated delivery
- **Decision:** Either accept two voices (LIVE vs scripted) or investigate Gemini LIVE voice customization (if/when available)

---

## 4. What Needs to Be Done

### 4.1 New Service: `geminiLive.ts`

- WebSocket client for `wss://generativelanguage.googleapis.com/ws/...`
- Session setup with system instruction (reuse `getAnuaSystemInstruction()`)
- Bidirectional audio streaming:
  - Mic → encode → send to Live API
  - Receive audio chunks → decode → play via expo-av
- Function calling for navigation, reading sections, etc.
- Reconnection and error handling

### 4.2 React Native Considerations

- **No official RN SDK** – use WebSocket + audio streaming
- **Microphone** – expo-av or `react-native-audio-api` for real-time capture
- **Audio playback** – stream chunks to expo-av or use a streaming audio solution
- **WebRTC/AEC** – Optional: community examples use WebRTC for echo cancellation (e.g. [pathakmukul/Gemini-LIVE-API-Bidirectional-Audio-in-React-Native](https://github.com/pathakmukul/Gemini-LIVE-API-Bidirectional-Audio-in-React-Native))

### 4.3 AnuaChatModal Changes

- Add **Conversation mode** vs **Text mode** (or “Chat” vs “Talk”)
- **Conversation mode:** Use Gemini LIVE – hold-to-talk or push-to-talk, real-time audio
- **Text mode:** Keep current flow (Gemini REST + optional ElevenLabs)
- UI: Mode toggle, connection status, speaking/listening indicators

### 4.4 Context Injection

- Chakra day, cosmic context, waiting room – must be passed into Live API system instruction or first turn
- Same context as `askAnua` / `askAnuaWithAudio`

### 4.5 Function Calling (Live API)

- **Navigate** – `navigate_to_screen(route)` → `router.push(route)`
- **Read section** – `read_section(sectionId)` → `readAsAnua()` (still ElevenLabs for scripted content)
- **Complete day** – if applicable

---

## 5. Phased Implementation

### Phase 1: Research & Prototype

- [ ] Verify Gemini LIVE API access (model availability, quotas)
- [ ] Test WebSocket connection from React Native (or via backend proxy)
- [ ] Prototype: mic → Live API → audio playback (minimal UI)
- [ ] Evaluate community RN examples (e.g. pathakmukul repo)

### Phase 2: Service Layer

- [ ] Implement `geminiLive.ts` – connect, send/receive audio, system instruction
- [ ] Integrate with `getAnuaSystemInstruction()` and context (chakra, cosmic, waiting room)
- [ ] Add function calling for navigation
- [ ] Error handling, reconnection, rate limits

### Phase 3: UI Integration

- [ ] Add Conversation mode to `AnuaChatModal`
- [ ] Mode toggle: Text vs Conversation
- [ ] Connection state, speaking/listening indicators
- [ ] Graceful fallback to text mode if Live API fails

### Phase 4: ElevenLabs Coexistence

- [ ] Keep ElevenLabs for anuaReader, rituals, navigation
- [ ] Document when each is used (conversation vs scripted)
- [ ] Optional: A/B test voice quality (LIVE vs ElevenLabs) for user preference

### Phase 5: Polish

- [ ] Interruption / barge-in behavior
- [ ] Latency tuning
- [ ] Cost monitoring (Live API vs REST + ElevenLabs)

---

## 6. Trade-offs

| Aspect           | Current (REST + ElevenLabs)            | Gemini LIVE                              |
| ---------------- | -------------------------------------- | ---------------------------------------- |
| **Latency**      | Higher (full round-trip)               | Lower (streaming)                        |
| **Voice**        | Custom ElevenLabs (Anua’s tuned voice) | Google’s voice (different character)     |
| **Interruption** | No                                     | Yes (barge-in)                           |
| **Cost**         | Gemini + ElevenLabs (two APIs)         | Gemini Live only (for conversation)      |
| **Offline**      | Cache/fallback possible                | Requires connection                      |
| **Complexity**   | Simpler                                | WebSockets, streaming, more moving parts |

---

## 7. ElevenLabs Summary

| Keep ElevenLabs For                                                          | Move to Gemini LIVE For                  |
| ---------------------------------------------------------------------------- | ---------------------------------------- |
| anuaReader (read text aloud)                                                 | Real-time conversation replies           |
| anuaRitualService (intro/outro)                                              | User speech → Anua speech (conversation) |
| anuaNavigation ("taking you there")                                          |                                          |
| Fallback when Live unavailable                                               |                                          |
| Text-mode "Hear responses" (optional: could stay ElevenLabs for consistency) |                                          |

**Recommendation:** Treat Gemini LIVE as an **additional** conversation mode. Keep ElevenLabs for scripted, non-conversational voice. This preserves Anua’s tuned voice for rituals and reading while enabling natural back-and-forth in conversation mode.

---

## 8. Files to Create/Modify (When Implementing)

| File                                  | Action                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| `src/services/geminiLive.ts`          | **Create** – WebSocket client, audio streaming, function calling  |
| `components/social/AnuaChatModal.tsx` | **Modify** – Add Conversation mode, mode toggle                   |
| `src/services/gemini.ts`              | **Modify** – Export shared context builder for Live API           |
| `src/services/elevenlabs.ts`          | **No change** – Keep for scripted voice                           |
| `app.config.js`                       | **Modify** – Add Live API config if needed (e.g. model, endpoint) |
| `src/utils/rateLimiter.ts`            | **Modify** – Add `geminiLive` rate limit if separate from REST    |

---

## 9. Dependencies to Evaluate

- WebSocket: `ws` or built-in `WebSocket` (React Native has limited support; may need `react-native-websocket` or similar)
- Audio streaming: expo-av for playback; may need `react-native-live-audio-stream` or equivalent for mic streaming
- Optional: Pipecat, LiveKit, or Fishjam for higher-level abstractions (adds another layer)

---

## 10. Security Notes

- **Client → Live API:** Requires ephemeral tokens; do not expose long-lived API keys in the app
- **Backend proxy:** Safer for production; backend holds API key, client talks to backend
- Current Gemini keys are in `app.config.extra`; Live API may need a different auth flow (e.g. Firebase Auth + backend-issued token)
