# Custom Friend Invite – Plan

## Problem
- Tapping "Share invite" / "Share via Messages, Email..." opens the **native iOS share sheet** on top of the app.
- The modal often closes as soon as share is triggered, so the user sees a generic system UI and the in-app design disappears → feels "ugly and broken."
- No preview of what’s being shared, so it doesn’t feel intentional or "healing flow."

## Goals
1. **Fully custom first screen** – All invite actions live inside a single, beautiful modal that matches app design (depth, gradients, earthy/cyan tones).
2. **Copy link first** – Many users prefer copying the link; make it primary and visible so the system share sheet is optional.
3. **Clear preview** – Show a short "Your invite message is ready" and optionally a truncated link so it feels complete and working.
4. **Standard behavior preserved** – "Share via message or app" still uses the system share sheet when the user chooses; we just don’t make it the only or default experience, and we don’t close the modal when we open the sheet.
5. **Healing flow** – Headline and copy that fit the app (e.g. "Share the journey," "Add to the room").

## Design Principles (match app)
- Dark gradient background, soft cyan/sage borders and accents.
- Signature depth: subtle shadows, gradient borders (e.g. `rgba(6, 182, 212, 0.2)`, `rgba(135, 174, 115, 0.4)`).
- Primary CTA: Copy link (sage/cyan gradient button).
- Secondary CTA: Share via message or app (outline/secondary style).
- Optional: small preview area with muted text showing "Join me on a healing journey..." and the link.

## Implementation

### 1. TribeRoomInviteModal ("Add to Room")
- **Preview block:** Add a compact, muted box showing a one-line preview of the invite message (e.g. "Join me on a healing journey through the 7 chakras! …") and the referral link (truncated with "…" if long). Gives the sense that "it’s ready."
- **Copy link = primary:** Move "Copy link" above "Share invite"; style as primary (gradient, prominent). On copy: show "Link copied!" and optionally keep modal open so they can also share.
- **Share = secondary:** Rename to "Share via message or app" (or "Send to Messages, Email…"). When tapped, call `Share.share()` but **do not close the modal** in `finally`. Close only:
  - when user taps Close, or
  - when user taps "Find friends on Soul School," or
  - optionally when `result.action === Share.sharedAction` (after successful share).
- **Modal stays open:** So the flow is: user sees custom modal → copies link and/or shares → closes when done. No disappearing modal when the system sheet appears.

### 2. InviteFriendModal ("Build Your Tribe")
- Apply the same pattern: preview block (optional), Copy link primary, Share secondary, don’t close on opening share sheet.
- Reuse the same visual language (gradients, borders, typography).

### 3. Shared styling
- Reuse gradient colors and border radii from CommitmentGate / FirstMondayPresenceModal where applicable.
- Keep existing `generateInviteMessage` and `generateReferralLink`; no change to standard app configurations (link, message, Share API).

## Files to change
- `components/tribe/TribeRoomInviteModal.tsx` – preview, reorder CTAs, remove close in share `finally`.
- `components/invite/InviteFriendModal.tsx` – same behavior and styling alignment.

## Why it wasn’t "working" / looked wrong
- **Closing the modal** in `handleShare`’s `finally` made the custom UI disappear as soon as the system share sheet was shown, so the user only saw the system UI.
- **No preview** made it unclear what would be shared.
- **Share as primary** encouraged opening the system sheet first, which doesn’t match the app’s custom look.

After changes: the invite flow is a single, cohesive custom screen; copy link works as the main path; share is optional and no longer hides the app’s design.
