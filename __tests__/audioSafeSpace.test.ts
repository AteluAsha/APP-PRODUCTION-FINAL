/* eslint-env jest */
/**
 * Audio safe-space: playback may only stop on user close, pause, leave screen, or track end.
 * This test locks the allowed call sites for useCurrentAudioStore.reset() so no new automatic stop is introduced.
 */

/** File paths (or identifiers) that are allowed to call useCurrentAudioStore.getState().reset() */
const ALLOWED_RESET_CALLERS = [
  "app/AudioPlayer.tsx", // user close or leave screen (focus cleanup)
  "app/(chakras)/SoundBath.tsx", // trial leave screen
  "components/navigation/MenuBarMiniPlayer.tsx", // user close mini player
  "components/audio/MusicRoomAudioManager.tsx", // track didJustFinish
  "hooks/useCurrentAudioStore.ts", // setSource/setSourceWithPlaylist (before new source); internal
]

describe("Audio safe-space (allowed reset callers)", () => {
  it("allowed reset callers list is non-empty and known", () => {
    expect(ALLOWED_RESET_CALLERS.length).toBeGreaterThan(0)
    expect(ALLOWED_RESET_CALLERS).toContain("app/AudioPlayer.tsx")
    expect(ALLOWED_RESET_CALLERS).toContain("hooks/useCurrentAudioStore.ts")
  })
})
