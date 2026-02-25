# Pre-Production Cleanup Archive

**Delete this file before production.** It documents removals and optional cleanups done during the final E2E audit (Feb 2026).

---

## Removals applied (safe, already done)

- **ChakraHome.tsx**
  - Removed `WelcomeModal` from waiting block. Path selection after first date is only via Profile sheet "Return to Soul School Course Selection"; welcome never auto-opens on app open.
  - Removed `showWelcomeModal` state and `handleWelcomeModalClose` / `handleBeginJourney` (only served the removed modal).
  - Removed commented imports: `FrequencyHealingIcon`, `MiniAudioPlayer` (components disabled; FrequencyHealingIcon file no longer exists).

---

## Additional cleanups applied (Feb 2026)

- **MiniAudioPlayer.tsx** – Deleted. Replaced by MenuBarMiniPlayer; no remaining app imports.
- **utils/invite.ts** – Deleted. `generateReferralLink`, `generateInviteMessage`, `getAppStoreLink`, and `INVITE_*` copy moved to `utils/shareDestinations.ts`. All callers (InviteFriendModal, TribeRoomInviteModal, FindFriendsModal, ShareAppModal) now import from `shareDestinations`.
- **DevGalleryTrigger.tsx** – Deleted. Was never rendered; StorybookShell comment updated. CaptureAll still available via `EXPO_PUBLIC_CAPTURE_SCREENS=1` in _layout.
- **.cursorrules** – Protected path updated from `app/backups/` to `android/_backups/` to match .easignore and repo.
- **iOS Soucha (clean local build):** Removed `ios/build` and `ios/Pods`, then ran `pod install` in `ios/`. Next `expo run:ios` will build from a clean state. Repeat anytime: `cd ios && rm -rf build Pods && pod install`.

## Optional pre-production deletions (review before deleting)

- _(None pending.)_ WelcomeModal was already removed; dev gallery (CaptureAll / gallery-config) was updated to no longer depend on it.

---

## Pathways verified (no conflicts)

- **Entry:** `app/(chakras)/index.tsx` – Lifetime → ChakraHub; trial completedTrialCourses === 1 → DateSelection; courseStartDate → ChakraHome; else → WelcomeScreen.
- **Path selection:** Only from index (no date) or Profile sheet "Return to Soul School Course Selection". No other route sends to WelcomeScreen after date set.
- **Lifetime → DateSelection:** Only via ChakraHub "Start a new 7 Day Somatic Journey" (course-mode button).
- **Audio:** Only user close, pause, screen leave, or track end stop playback. Anua does not control healing audio.

---

## Files not to delete (still in use)

- **PathSelectionGate** – Used in `_layout.tsx`; safety overlay on WelcomeScreen so "Enter Path" is never stuck.
- **WelcomeScreen.tsx** – Path selection route; required.
- **DateSelection.tsx** – Required for trial and lifetime course-mode flow.
- **useFirstLaunchStore** – Still used for waiting-screen and timegate logic in ChakraHome.

---

## E2E consistency check (post-cleanup)

- **Entry (index):** Four-way split correct; no duplicate or conflicting routes.
- **WelcomeScreen:** Only from index (no date), ProfileSheet, DateSelection back, RestingBlessing, ChakraHome redirect, dev TrialTestFlow.
- **DateSelection:** From index (completedTrialCourses === 1), WelcomeScreen Enter Path, WaitingScreen back, ChakraHub course button, ReturnToCourseModal.
- **ChakraHub:** From index (lifetime), DateSelection (lifetime back), Profile close, CommitmentGate (purchase), GoodbyeModal, etc.
- **ChakraHome:** From index (trial with date), DateSelection Begin, AudioPlayer close (replace), CommitmentGate (trial), etc.
- **Audio:** Single-owner rules and safe-space docs in place; no Anua control of healing audio.
- **Lints:** No new errors from cleanup.

---

## App health score and path to 100

See **APP_HEALTH_SCORE_AND_PATH_TO_100.md** for the current score (0–100), what each remaining task is worth, and the checklist to reach 100.
