# Android E2E Audit: Tribe Chat, Soul School IDs, Messaging, Notifications

## Summary

Audit covered Tribe Chat sync, Soul School ID usage, invite/messaging flows, and app notification settings on Android. Two code fixes were applied; the rest of the flows are correctly wired and ready for device verification.

---

## 1. Tribe Chat (phone-to-phone sync)

### Architecture

- **Messages:** Firestore `tribes / global-trial-tribe / messages` with `text`, `senderName`, `createdAt`. [hooks/useTribeChat.ts](hooks/useTribeChat.ts) uses `onSnapshot` for real-time sync.
- **Room members:** `tribeRooms / global-trial-tribe / members` (connected friends). [hooks/useTribeFriends.ts](hooks/useTribeFriends.ts).
- **Invites:** `tribeInvites` collection; [useTribeInvitesToMe](hooks/useTribeInvitesToMe.ts) subscribes to pending invites for current user; accept/decline in [src/services/tribeInvites.ts](src/services/tribeInvites.ts).

### Fix applied

- **Sender name in chat:** Messages were sent with hardcoded `"Guest"`. They now use the user’s display name from presence (`presenceDisplayName || "Soul"`), so Tribe Chat shows the correct name and stays consistent across devices. Primary-user bubble alignment uses the same display name.

### What to verify on Android

- Open Tribe Chat, send a message: it shows your display name (or “Soul”) and appears on the right.
- From a second device/account, open Tribe Chat and confirm messages appear in real time.
- “Build Your Tribe” / invite flow: share link, open on second device; accept invite and confirm both see each other in the room and in chat.

---

## 2. Soul School ID

### Where it’s used

- **Source:** [src/services/userId.ts](src/services/userId.ts) (getUserId / requestNewUserId) and [src/services/soulSignature.ts](src/services/soulSignature.ts) (Soul Signature format).
- **Profile:** [components/profile/ProfileSheet.tsx](components/profile/ProfileSheet.tsx) shows “Soul School ID”, copy button, and “Request New Soul School ID”.
- **Invites:** [InviteFriendModal](components/invite/InviteFriendModal.tsx) gets `getUserId()` as `senderSoulSchoolId` and passes it to [generateInviteMessage](utils/shareDestinations.ts); the shared message includes “Soul School ID: {id}”.
- **ChakraHub / ChakraHome:** Profile button accessibility hint references “Soul School ID”.
- **RevenueCat:** [src/services/revenuecat.ts](src/services/revenuecat.ts) links purchases to `userId`; `linkUserId` is called after “Request New Soul School ID”.

### What to verify on Android

- Open profile (from ChakraHub or ChakraHome): Soul School ID is visible and copy works.
- “Request New Soul School ID”: confirm dialog, then new ID appears and copy still works.
- Send an invite (e.g. Build Your Tribe or invite from Tribe): open shared message and confirm “Soul School ID: …” is present.

---

## 3. Invite ref and “Create the Connection”

### Invite ref (link)

- **Storage:** [src/services/inviteRefStorage.ts](src/services/inviteRefStorage.ts) stores ref from `soulschool.app/invite?ref=INVITER_ID`.
- **Apply:** [InviteRefApplier](components/invite/InviteRefApplier.tsx) runs in root layout; when there is a pending ref and a user (getUserId + presence), it calls `applyPendingInviteRef(displayName, profilePicUrl)` and marks the inviter’s pending member in `tribeRooms/…/members` as “connected”.

### Tribe invites (Create the Connection)

- **Create:** [createTribeInvite](src/services/tribeInvites.ts) (fromUserId, toUserId, displayName, avatar, roomId).
- **Subscribe:** [useTribeInvitesToMe](hooks/useTribeInvitesToMe.ts) uses `getUserId()` and `subscribeTribeInvitesToUser(toUserId, setPendingInvites)`.
- **Accept:** Adds current user to `tribeRooms/{roomId}/members` and sets invite status to “accepted”.

### What to verify on Android

- Open invite link (e.g. `https://soulschool.app/invite?ref=SomeSoulId`) in browser, then open app: after profile/presence is set, inviter should see the new member as connected (if that UI is present).
- From Profile Preview or similar, “Create the Connection”: invite is created. On the other device, Tribe Chat “Pending invites” shows it; Accept and confirm both see each other in the room and can chat.

---

### Invite date sync (both phones same journey week)

- **Link:** Invite URLs now include the inviter's journey start date when available: `soulschool.app/invite?ref=INVITER_ID&start=YYYY-MM-DD`. [generateReferralLink](utils/shareDestinations.ts) accepts optional `startDateISO`; all invite entry points (InviteFriendModal, WaitingScreen, TribeRoomInviteModal, FindFriendsModal) pass the inviter's `courseStartDate` so the shared link has `&start=...`.
- **Deep link:** [app/_layout.tsx](app/_layout.tsx) handles `/invite?ref=...&start=...`. If `start` is present and matches `YYYY-MM-DD`, it is stored via [setPendingInviteStartDate](src/services/inviteRefStorage.ts).
- **Apply:** [InviteRefApplier](components/invite/InviteRefApplier.tsx) runs after applying the ref: it reads the pending start date, validates it as a date, and if the invitee has no existing `courseStartDate`, calls `setCourseStartDate` and `startJourney` so both phones open and sync to the inviter's start date, then clears the pending start.

### What to verify on Android (invite + date sync)

- Open invite link (e.g. `https://soulschool.app/invite?ref=SomeSoulId`) in browser, then open app: after profile/presence is set, inviter should see the new member as connected (if that UI is present).
- **Date sync:** Send an invite from the waiting room or Tribe (link includes `&start=YYYY-MM-DD`). Open the link on a second device; complete onboarding. The second device should show the same journey start date and week as the inviter (no extra date picker if start was in the link).
- From Profile Preview or similar, "Create the Connection": invite is created. On the other device, Tribe Chat "Pending invites" shows it; Accept and confirm both see each other in the room and can chat.

---

## 4. App notification settings (Android)

### Implementation

- **Permission:** [src/services/journeyNotifications.ts](src/services/journeyNotifications.ts): `hasNotificationPermission()`, `requestNotificationPermissions()` (used from DateSelection and WaitingScreen).
- **Pre-prompt:** [CommunicationReminderModal](components/chakras/CommunicationReminderModal.tsx) explains notifications before the system dialog.
- **Channel:** Android channel “journey-reminders” is created in `ensureAndroidChannel()` (name “Journey Reminders”, importance DEFAULT, vibration, light color). App config [app.config.js](app.config.js) has `expo-notifications` with `defaultChannel: "journey-reminders"` and `color: "#9D4EDD"`.
- **Scheduling:** After date selection or when enabling on waiting room, `scheduleJourneyReminders(courseStartDateISO)` schedules 3, 2, and 1 day before start at 9:00 AM local. [DateSelection](app/(chakras)/DateSelection.tsx) and [WaitingScreen](components/chakras/WaitingScreen.tsx) call it when the user has (or grants) permission.

### Fix applied

- **Android channel in content:** Scheduled notification content now includes `channelId: CHANNEL_ID` on Android (in addition to trigger), so the reminder uses the “Journey Reminders” channel consistently.

### What to verify on Android

- First launch / date selection: if you accept the in-app pre-prompt and then the system permission, journey reminders should be scheduled (3, 2, 1 day before at 9 AM).
- Waiting room: “Enable reminders” (or equivalent) requests permission and schedules reminders if granted.
- Device Settings → Apps → Soul School → Notifications: “Journey Reminders” channel should exist; toggles should control whether reminders show.
- SCHEDULE_EXACT_ALARM is in [AndroidManifest](android/app/src/main/AndroidManifest.xml) (or from expo-notifications); if reminders don’t fire when app is closed, check battery optimization / “Allow exact alarms” for Soul School.

---

## 5. Firestore collections (reference)

| Collection / path              | Purpose |
|--------------------------------|---------|
| `tribes/{tribeId}/messages`    | Tribe Chat messages (real-time) |
| `tribeRooms/{roomId}/members`  | Room members (connected + pending from link) |
| `tribeInvites`                 | Pending invites (Create the Connection); query by toUserId, status pending |
| `users/{userId}`               | User/scholarship data (e.g. userScholarshipStatus) |
| Profiles                       | See profileService / socialSanctuary for profile and sanctuary data |

Ensure Firestore rules and indexes allow:

- `tribes/global-trial-tribe/messages`: read/write for app users (and orderBy createdAt if used).
- `tribeInvites`: read for toUserId, write for create/update.
- `tribeRooms/global-trial-tribe/members`: read/write for app users.

---

## 6. Checklist for Android device

- [ ] Tribe Chat: send message, see own display name and right-aligned bubble.
- [ ] Tribe Chat: second device receives messages in real time.
- [ ] Invite via “Build Your Tribe” or share: message includes Soul School ID; other user can open link and join.
- [ ] Profile: Soul School ID visible, copy works, “Request New Soul School ID” updates and persists.
- [ ] Pending invites in Tribe Chat: accept/decline and confirm member list updates.
- [ ] Notifications: grant permission on date select or waiting room; check Settings → Notifications for “Journey Reminders”; optionally wait for a scheduled time or test with a short-date to confirm delivery.
