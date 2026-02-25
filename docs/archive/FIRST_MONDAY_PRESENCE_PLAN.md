# First Monday Presence & Hamburger Menu – Implementation Plan

## Overview

On the first Monday (when the waiting room and time gate open to the first day), trigger a one-time “Give yourself a sound” pop-up. It collects the user’s name and an optional visual expression (profile image), then syncs this into their account and gives them a digital “Soul School ID.” If they skip, they can complete this later from the hamburger menu. The hamburger lives on both App1 and App2 home screens in a consistent, subtle spot.

---

## Clarifications / Assumptions

1. **“Give themselves a sound”**  
   Interpreted as: choose how they want to be called (their “sound” in the world) = **display name**. So the modal prompts for **name** and **visual expression** (photo).

2. **When exactly to show the pop-up**  
   Show **once** when the user **first sees the main home (non–waiting) screen on or after the course start Monday**—i.e. the first time `showWaitingScreen` is false and the journey has started (or they’ve reached the first Monday). So: **first time we render ChakraHome’s main content (not WaitingScreen) after the course has started**, and only if they haven’t completed presence onboarding yet.

3. **“Trial begins”**  
   After they submit (or skip), the modal closes and they see the normal Day 1 home. No extra “trial begins” screen unless you want a short confirmation line in the modal (e.g. “Your trial begins now”).

4. **Hamburger on both homes**  
   Already present on both ChakraHome (App1) and ChakraHub (App2) as the waffle icon that opens ProfileSheet. Plan: **keep one hamburger per home**, ensure **same position and style** on both (subtle, non-obstructing), and make the ProfileSheet the place where they can add/edit name and photo later if they skipped.

5. **Soul School ID**  
   Use existing `getUserId()` (persisted in AsyncStorage). Display as “Soul School ID” in ProfileSheet and in Tribe Friends menu. No new ID system; we only surface the existing ID and tie it to the new display name + photo.

---

## Phase 1: Presence / Profile Data Store

### 1a. Create `usePresenceStore` (or extend existing store)

**Goal:** Persist display name, profile image URI, and “has completed first-Monday presence onboarding.”

**Suggested state:**

```ts
// hooks/usePresenceStore.ts (or add to a small profile slice)
interface PresenceState {
  displayName: string | null
  profileImageUri: string | null // local file URI or Firebase Storage URL after upload
  hasCompletedFirstMondayPresence: boolean // true after they submit or dismiss with "later"

  setDisplayName: (name: string | null) => void
  setProfileImageUri: (uri: string | null) => void
  setHasCompletedFirstMondayPresence: (value: boolean) => void
  // Optional: clearPresence for testing
}
```

- Persist with Zustand + AsyncStorage (or MMKV) so it survives restarts.
- `hasCompletedFirstMondayPresence`: set to `true` when they **submit** the first-Monday modal, or when they **explicitly dismiss** it (e.g. “I’ll do this later”). So we only show the modal when `!hasCompletedFirstMondayPresence` and we’re in the “first Monday open” situation.

**File:** `hooks/usePresenceStore.ts` (new), or add to an existing profile/presence module if you prefer.

---

## Phase 2: First-Monday Detection

### 2a. When is it “first Monday”?

- **Condition:** We’re on ChakraHome, **not** showing WaitingScreen, **and** either:
  - Journey just started this session (e.g. `journeyStarted` became true and `courseStartDate` is reached and it’s Monday), or
  - It’s the first time we’re rendering the main ChakraHome content (no waiting) for this user on or after their course start Monday.
- **Simplest implementation:** In ChakraHome, when we’re about to render the main content (the branch where `!showWaitingScreen` and we’re past loading/error):
  - If `!hasCompletedFirstMondayPresence` (from presence store) **and** “today is the course start Monday or later” (e.g. `hasReachedCourseStartDate` and we’re in the first week, or more generally: course has started and we’re not on waiting screen), then **show the First Monday Presence modal** once.
- **One-time:** After they submit or choose “later”, set `hasCompletedFirstMondayPresence = true` so the modal never shows again.

### 2b. Edge cases

- **Lifetime user in somatic journey:** Same rule: first time they see the main ChakraHome content (timegate journey, first Monday), show the modal if `!hasCompletedFirstMondayPresence`.
- **They never set a date / never see Monday:** Then they stay on WaitingScreen; modal never shows. When they eventually get to a Monday and waiting disappears, we show it then.
- **Reinstall:** No persistence of `hasCompletedFirstMondayPresence` across installs unless you back it up; then they’d see the modal again (acceptable).

---

## Phase 3: First Monday Presence Modal

### 3a. Component: `FirstMondayPresenceModal`

**Props:** `visible`, `onClose`, `onComplete` (optional: called after save).

**Content:**

1. **Headline:** e.g. “Give yourself a sound”
2. **Subcopy:** Short line about choosing how you want to be called and a visual expression (e.g. “Enter your name and add a photo so your journey feels yours.”)
3. **Name input:** Single text field, “Your name” or “What do you want to be called?”
4. **Visual expression:** Button or area: “Add a visual expression” → opens image picker (camera or library). Show thumbnail if they picked one. Optional; they can skip.
5. **Primary action:** “Begin” or “Start my journey” → save name + image URI to presence store, set `hasCompletedFirstMondayPresence = true`, close modal, call `onComplete` if provided.
6. **Secondary action:** “I’ll do this later” or “Skip for now” → set `hasCompletedFirstMondayPresence = true`, close modal (no save). They can add name/photo later in the hamburger (ProfileSheet).

**Design:** Same dark, sage-accent style as the rest of the app; depth/gradient as in CommitmentGate/Tribe screens.

**Storage:**

- Name and image URI saved in presence store (and persisted).
- Optionally upload image to Firebase Storage and store the download URL in presence store (and later in Firestore for Tribe/sync). Phase 1 can be local-only; upload can be Phase 4.

---

## Phase 4: Sync to “Account” and Soul School ID

### 4a. What “sync and populate their account data” means

- **Local:** Presence store already holds display name and profile image (URI or URL). This **populates**:
  - **ProfileSheet (hamburger):** Show `displayName` (or “You” if empty), show profile image if set, show Soul School ID from `getUserId()`.
  - **Tribe Friends menu (and Tribe chat):** Use same display name and profile image for “current user” and for Firestore member docs when they’re in a room.
- **Soul School ID:** Continue using `getUserId()`. Display in ProfileSheet as “Soul School ID: …” (or “User ID: soul-school-…”). No new ID; just consistent naming and visibility.
- **Remote (optional / later):** If you have a Firestore `users/{userId}` or similar, you can write displayName and profilePicUrl there so Tribe and other features stay in sync across devices. For a first version, local + Tribe room member doc on first message is enough.

### 4b. ProfileSheet updates

- **Data source:** Read `displayName` and `profileImageUri` from presence store; read ID from `getUserId()`.
- **Display:** Show display name (or “You” / “Add your name” if empty). Show profile image if present; else placeholder.
- **Edit:** “Edit profile” or “Add name & photo” that opens either an inline form or a small editor modal (same fields as First Monday modal: name + photo). On save, update presence store (and optionally Firestore).

---

## Phase 5: Hamburger Menu Placement (Both Home Screens)

### 5a. Current state

- **ChakraHome:** Waffle (hamburger) top-right opens ProfileSheet. There is also a separate hamburger for “return to ChakraHub” when `hasLifetimeAccess` (top-left).
- **ChakraHub:** Waffle top-right opens ProfileSheet; ActionBar has back on left.

### 5b. Target

- **One consistent hamburger** on each home (App1 = ChakraHome, App2 = ChakraHub) that opens **ProfileSheet** (profile, name, photo, Soul School ID, and “do it later” flow).
- **Placement:** “Subtle, same for both, not in the way.”
- **Recommendation:**
  - **Position:** Top-right on both screens: e.g. `top: insets.top + 12`, `right: 16`, same size (e.g. 40x40), same style (semi-transparent dark circle, light icon).
  - **ChakraHome:** Remove or repurpose any duplicate “profile” control so only one hamburger opens ProfileSheet. Keep the lifetime-only “return to Hub” control on the **left** (it’s a different action).
  - **ChakraHub:** Keep hamburger top-right; ensure same `insets.top + 12` and `right: 16` as ChakraHome so they feel like the same place.
  - **Z-index:** Below any critical CTAs; above background content so it’s tappable but not blocking.

### 5c. No obstructions

- Ensure the hamburger doesn’t overlap the main hero text, primary buttons, or chakra stack. If the design has a “chakras 101” or similar link top-right, either combine it with the hamburger (e.g. open ProfileSheet which also has a link to Chakras 101) or place the hamburger slightly lower or left so both fit without overlap.

---

## Phase 6: Implementation Order

### Step 1: Presence store

- Add `usePresenceStore` with `displayName`, `profileImageUri`, `hasCompletedFirstMondayPresence`, persisted.

### Step 2: First Monday detection in ChakraHome

- In the branch where we render main content (not WaitingScreen, not Preview, not paywall), add: if `!hasCompletedFirstMondayPresence` and course has started (e.g. `hasReachedStartDate` and we’re not on waiting), set state to show `FirstMondayPresenceModal` once per session (or use a ref so we only trigger once after mount in that state).

### Step 3: FirstMondayPresenceModal UI

- Modal with headline, name input, “Add visual expression” (image picker), “Begin” and “I’ll do this later.”
- On “Begin”: save to presence store, set `hasCompletedFirstMondayPresence`, close.
- On “I’ll do this later”: set `hasCompletedFirstMondayPresence`, close.

### Step 4: ProfileSheet uses presence store

- Show `displayName` (or “You” / placeholder) and `profileImageUri` (or placeholder avatar).
- Show Soul School ID from `getUserId()`.
- Add “Edit” to update name and photo (same fields as First Monday modal).

### Step 5: Hamburger consistency

- ChakraHome: ensure one hamburger top-right (ProfileSheet), same position as ChakraHub.
- ChakraHub: align position to `insets.top + 12`, `right: 16` if not already.
- Verify no overlap with other controls.

### Step 6 (optional): Firestore/Storage

- Upload profile image to Firebase Storage, store URL in presence store and in Firestore `users/{userId}` (or tribe member doc) so Tribe and other screens stay in sync.

---

## Files to Add or Touch

| Item                                               | Action                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `hooks/usePresenceStore.ts`                        | **Create** – displayName, profileImageUri, hasCompletedFirstMondayPresence, persisted        |
| `components/presence/FirstMondayPresenceModal.tsx` | **Create** – modal UI and logic                                                              |
| `components/chakras/ChakraHome.tsx`                | **Edit** – first-Monday check, show FirstMondayPresenceModal, ensure one hamburger top-right |
| `components/profile/ProfileSheet.tsx`              | **Edit** – read from presence store, show name/photo/ID, add “Edit” flow                     |
| `app/(chakras)/ChakraHub.tsx`                      | **Edit** – align hamburger position with ChakraHome                                          |
| `src/services/userId.ts`                           | **Optional** – keep as is; only use for “Soul School ID” label in UI                         |

---

## Open Questions for You

1. **“Give themselves a sound”** – Confirm: is this only the **name**, or do you also want a short **audio** (e.g. record a mantra or a word they want to be “their sound”)? If audio, we’d add a record step and store a clip URL.
2. **Visual expression** – Confirm: **profile photo only**, or allow a **drawing / custom image** (e.g. from camera roll only, or also a simple drawing canvas)?
3. **Copy for “later”** – Prefer “I’ll do this later”, “Skip for now”, or “Maybe later”?
4. **Soul School ID format** – Prefer “Soul School ID: user_1234_abc” or “soul-school-abc123” (short suffix only)? We can derive a short code from `getUserId()` if you want a friendlier share format.

---

## Summary

- **First Monday:** When the app first shows the main home (no waiting) on or after the course start Monday, show a one-time “Give yourself a sound” modal: name + optional profile photo, then “Begin” or “I’ll do this later.” Persist choice and set a “presence completed” flag so we don’t show again.
- **Account / ID:** Use existing `getUserId()` as Soul School ID; persist name and photo in a new presence store; surface both in ProfileSheet and (where relevant) in Tribe.
- **Hamburger:** Keep one hamburger on both ChakraHome and ChakraHub, top-right, same position and style, opening ProfileSheet so they can add or edit name and photo anytime.

If you confirm the two clarifications (sound = name only? visual = photo only?) and the open questions, next step is implementing Phase 1–5 in code.
