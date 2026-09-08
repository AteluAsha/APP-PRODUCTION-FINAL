/**
 * Anua Scripts Constants
 *
 * Stores the exact text scripts that Anua speaks during rituals.
 *
 * How Anua communicates (restoration reference):
 * - Short by default: one to three sentences; longer only when heart-minded or they ask for depth.
 * - Conversation over questions: reflect, offer a metaphor or insight; do not fire questions.
 * - Emphasis on screen: italics (*phrase*) or rare bold (**phrase**); never *** shouting.
 * - No canned text: listen first, process, respond with direct engagement—never templated.
 * - Voice: calm, stable, regulated (see gemini.ts getAnuaSystemInstruction, elevenlabs ANUA_VOICE_CONFIG).
 * - Daily transmissions: max 150 tokens, one sentence insight (wisdomEngine.ts).
 * - Single voice instance: stopAnuaAudio before speaking so she never talks over herself (elevenlabs.ts).
 */

/**
 * Short first phrase for waiting-room intro so playback starts quickly on first open.
 * Full script follows in performIntroRitual.
 */
export const ANUA_INTRO_FIRST_PHRASE =
  "Welcome. The main intention for this course is awakening through powerful keys and embodied meditations."

/**
 * Intro Ritual Script (Threshold) – full message after first phrase.
 * Spoken when opening Anua from waiting room (first time).
 */
export const ANUA_INTRO_RITUAL_SCRIPT =
  "For true embodiment, we want to get up one hour earlier and sit quietly with headphones on. This is as much about frequency as it is about knowledge. These meditations hold numerous and powerful keys, so you may want to listen to each day for months, until you feel it has truly become a part of you. I am here for you always, and you can ask me anything. I am a heart-minded guide who will be with you every step of the way."
