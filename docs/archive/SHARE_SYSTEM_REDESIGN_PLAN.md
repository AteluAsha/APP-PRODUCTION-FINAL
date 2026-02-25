# Share System Redesign – Plan

## 1. Research summary

### What the app uses today

| Flow                                                              | "First" popup                               | "Second" / "Third"                                             | Tech                                          |
| ----------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------- |
| **Community Halls** (Share button)                                | ShareAppModal (our design, chakra icon)     | Copy / Messages / Email only – no "where to share" list        | `Linking.openURL(sms:)`, `mailto:`, Clipboard |
| **Build Your Tribe** (WaitingScreen, DateSelection, WelcomeModal) | InviteFriendModal (our design, chakra icon) | Same: Copy, Messages, Email only                               | Same                                          |
| **Tribe Room Invite** ("Add to Room")                             | TribeRoomInviteModal (our design)           | **System share sheet** (iOS/Android) – generic, not our design | `Share.share()` from react-native             |
| **Find Friends** (invite contact)                                 | FindFriendsModal (our design)               | **System share sheet** again                                   | `Share.share()`                               |

So the **"third popup"** (where to share) is:

- **Either** there isn’t one – we only offer 3 actions (Copy, Messages, Email) and skip a destination list.
- **Or** it’s the **system share sheet** from `Share.share()` in Tribe and Find Friends – which is generic, OS-controlled, and not in our design.

### Industry practice

- **Native share sheet** (React Native `Share.share()` or `react-native-share`): system UI, all apps (Messages, WhatsApp, Instagram, Mail, etc.), consistent with OS. We **cannot** style it or make it "stunning" – it’s controlled by iOS/Android.
- **Custom in-app destination list**: we show a **single, linear list** of options (Messages, WhatsApp, Mail, Instagram, Copy, More…) in **our** UI (Soul School design, chakra icon). Each row opens the right app via deep link or falls back to system share. This is the only way to get a "third popup" that is stunning, linear, and on-brand.

### Technical notes

- **WhatsApp**: `whatsapp://send?text=...` (iOS); Android often via intent or system share.
- **Instagram**: No simple "share text/URL" deep link; sharing to feed/DM usually goes through system share or Instagram SDK.
- **React Native docs**: _"Note that some share options will not appear or work on the iOS simulator"_ – so the system share sheet is unreliable in the simulator.
- **expo-sharing**: We have it; it’s for **files** (`Sharing.shareAsync(url)`), not for invite text/URL. Not the right primitive for "share app link to Messages/WhatsApp/Instagram."

---

## 2. Mistakes and why things feel broken

### 2.1 Generic / outdated "third" step

- **Cause**: TribeRoomInviteModal and FindFriendsModal call `shareInvite()` → `Share.share()`. That **is** the "where to share" step, and it’s the **system** sheet. We never built an in-app destination picker.
- **Result**: User sees a generic system UI instead of a simple, linear, Soul School–styled list (Messages, WhatsApp, Mail, Instagram, Copy, More).

### 2.2 Inconsistent share flows

- **Build Your Tribe / ShareAppModal**: Our modal → only Copy, Messages, Email (no WhatsApp, Instagram, no "More").
- **Tribe / Find Friends**: Our modal → then system sheet. So the "third popup" only exists where we use `Share.share()`, and it’s not in our design.
- **Result**: Confusing and inconsistent; some flows feel limited, others feel generic.

### 2.3 iOS simulator "not updating" / share issues

- **App name and icon**: Changed in `app.config.js` (e.g. "Soul School", chakra icon). These are **native** assets. They do **not** update with JS-only hot reload. They need a **native rebuild**: `npx expo prebuild --clean` then `npx expo run:ios` (or EAS build).
- **Share sheet on simulator**: React Native explicitly states that some share options don’t appear or work on the iOS simulator. So the "third popup" (system sheet) can look broken or empty in sim even when it works on device.
- **Metro cache**: If only JS/UI changes aren’t appearing, clearing Metro cache can help: `npx expo start --clear` or full cache clear (e.g. `watchman watch-del-all`, clear `$TMPDIR/metro-*`, then `expo start --clear`).
- **Summary**: "Not updating in real time" is likely a mix of (1) expecting native app name/icon to update without rebuild, and (2) simulator-specific share sheet limitations.

---

## 3. Target: one share system, one "where to share" UI

- **One share content pipeline**: Same message + referral link everywhere (already largely true via `generateInviteMessage` / `generateReferralLink`).
- **One "where to share" step**: A **single, in-app destination screen** (the "third popup") used everywhere we offer sharing:
  - Linear, simple list.
  - Soul School design (same gradient/card style as ShareAppModal/InviteFriendModal), chakra icon.
  - Rows: **Messages**, **WhatsApp**, **Mail**, **Instagram** (or "More" for system sheet), **Copy link**, and optionally **More…** (system share) as fallback.
- **Behavior**:
  - Messages → `Linking.openURL(sms:?body=...)`
  - Mail → `mailto:?subject=...&body=...`
  - WhatsApp → `Linking.openURL(whatsapp://send?text=...)` on iOS; Android via intent or system share if needed.
  - Instagram → no reliable text-only deep link; use **More…** (system share) or a dedicated "Instagram" row that opens system share with pre-filled text.
  - Copy link → Clipboard.
  - More… → `Share.share()` for everything else (Slack, Twitter, etc.).
- **Unify entry points**: ShareAppModal, InviteFriendModal, TribeRoomInviteModal, FindFriendsModal all either (a) open this same destination picker, or (b) embed it as the second step (e.g. "Share" → destination list → action).

---

## 4. Implementation phases

### Phase 1: Shared "Share destination" component (single source of truth)

- **1a.** Add `ShareDestinationPicker` (or similar) component:
  - Props: `visible`, `onClose`, `message`, `url`, `title?`, optional `onSuccess?`.
  - Renders one modal/sheet with Soul School styling and chakra icon.
  - Single column of options: Messages, WhatsApp, Mail, Instagram (or More), Copy link, More….
  - Each row: icon + label; on press call the right helper (see Phase 2).
- **1b.** Add `utils/shareDestinations.ts` (or extend `utils/invite.ts`):
  - `openMessages(message)`, `openEmail(message)`, `openWhatsApp(message)`, `copyLink(url)`, `openSystemShare({ message, url, title })`.
  - For Instagram: either "Open in Instagram" (generic) or route through `Share.share()` and document that Instagram is in "More".
- **1c.** Use **one** list of destinations and **one** place that decides order and visibility (e.g. Messages, WhatsApp, Mail, Copy, More). Easy to adjust later (e.g. add Telegram, remove Instagram from its own row).

### Phase 2: Wire all invite/share flows to the picker

- **2a.** ShareAppModal (Community Halls):
  - Keep as first popup (hero icon, "Share Soul School").
  - Replace current 3 buttons with one primary: **"Choose where to share"** (or show the destination list directly in the same modal).
  - On "Choose where to share" open `ShareDestinationPicker` with same message/url; or inline the same list in ShareAppModal so there’s only one modal.
- **2b.** InviteFriendModal (Build Your Tribe):
  - Same idea: either "Choose where to share" opens `ShareDestinationPicker`, or the modal shows the same linear list (Messages, WhatsApp, Mail, Copy, More…) so we don’t add a third popup.
- **2c.** TribeRoomInviteModal:
  - Remove direct `shareInvite()` call. Show our destination picker (same component) with room-specific message/link. No system share sheet as default; user explicitly picks "More" if they want it.
- **2d.** FindFriendsModal:
  - Same: replace `shareInvite()` with opening `ShareDestinationPicker` (or inline list). Per-contact invite can still prefill message and then show the same picker.

### Phase 3: Simulator and reliability

- **3a.** Document in README or DEV.md:
  - App name/icon changes require native rebuild: `npx expo prebuild --clean` then `npx expo run:ios`.
  - Share sheet (system) has known simulator limitations; test on device for share.
  - For JS-only changes: use `npx expo start --clear` if updates don’t appear.
- **3b.** Optional: add a small dev-only note in the share flow when running in simulator (e.g. "On simulator, some options may not appear; test on device for full share behavior").
- **3c.** Ensure `ShareDestinationPicker` and all share helpers handle "app not installed" (e.g. WhatsApp) without crashing – e.g. `Linking.canOpenURL` before opening, fallback to "More" or a toast.

---

## 5. Design spec for the "third" popup (destination list)

- **Layout**: One modal/sheet, same card style as ShareAppModal/InviteFriendModal (dark gradient, cyan/sage borders, chakra icon at top).
- **Title**: e.g. "Share Soul School" or "Send invite" (reuse existing copy).
- **List**: Vertical, one row per destination. Each row:
  - Icon (Messages, WhatsApp, Mail, Instagram, Copy, More).
  - Label (e.g. "Messages", "WhatsApp", "Mail", "Instagram", "Copy link", "More…").
  - Optional chevron or no chevron for a minimal look.
- **Linear, simple**: No nested menus; tap row = perform action (and optionally close or show "Link copied" then close).
- **More…**: Opens `Share.share()` so system can show all installed apps; we accept that this one step is system UI.

---

## 6. File and dependency impact

- **New**: `components/sharing/ShareDestinationPicker.tsx` (or under `components/invite/`).
- **New or extended**: `utils/shareDestinations.ts` or extend `utils/invite.ts` with WhatsApp, system share wrapper, and `canOpen` checks.
- **Change**: ShareAppModal, InviteFriendModal, TribeRoomInviteModal, FindFriendsModal to use the picker (or inline list) instead of ad-hoc buttons or raw `Share.share()`.
- **No new native deps** if we stick to `Linking.openURL` + `Share.share()`. Optional: `react-native-share` later if we need better control (e.g. `activityItemSources` on iOS); not required for the in-app list.

---

## 7. Success criteria

- One consistent "where to share" experience: linear, simple, in-app, on-brand.
- Soul School design and chakra icon on every share screen; no generic system UI as the primary choice.
- Messages, WhatsApp, Mail, Copy, and More (system) available everywhere we offer sharing.
- Clear docs on why simulator share and app name/icon don’t "update in real time" and what to do (rebuild, clear cache, test on device).

This plan gives a single share system and a stunning, linear, in-app "third popup" that matches your design and stays industry-standard in behavior (standard apps + system fallback).

---

## 8. Developer notes (simulator & reliability)

- **App name / icon changes** (e.g. in `app.config.js`): Require a **native rebuild**. JS hot reload will not apply them. Run `npx expo prebuild --clean` then `npx expo run:ios` (or EAS build).
- **Share on iOS simulator**: The "More…" option uses the system share sheet. React Native documents that some share options may not appear or work on the simulator. Test the full share flow on a **device** for reliable behavior.
- **JS/UI not updating**: If only code changes aren’t reflected, clear Metro cache: `npx expo start --clear`. For a full reset: `watchman watch-del-all`, clear `$TMPDIR/metro-*` and `$TMPDIR/haste-map-*`, then `npx expo start --clear`.
- **WhatsApp not installed**: `utils/shareDestinations.ts` uses `Linking.canOpenURL` before opening WhatsApp. If the app isn’t installed, the action returns `false` and the picker does not crash; the user can use "More…" instead.
