# Energy Exchange, Donation, Write to Us & Reflection Diary – Implementation Plan

## Overview

Implement user-requested changes across Donation, EnergyExchange, Write to Us, Leave a Review, Record & Share, and Reflection Diary.

---

## 1. Donation – Use RevenueCat (Same as Paywall)

**Current:** Donate screen has UI but `handleDonate` simulates processing (1.5s delay, no real payment).

**Approach:** Add donation products to RevenueCat and App Store Connect. Both paywall and donations go to Project Starseed (same account).

**Requirements:**

- Add donation product IDs in App Store Connect (e.g. `donation_1`, `donation_5`).
- Add a "donations" offering in RevenueCat with these products.
- Donations are one-time consumable/non-consumable – no entitlement.
- Preset amounts: $1, $5. Custom amount: add $10, $25 presets (App Store IAP requires fixed product IDs).

**Implementation:**

- Add `DONATION_1`, `DONATION_5` (and optionally `DONATION_10`, `DONATION_25`) to `revenuecat.ts` `PRODUCT_IDS`.
- Create `getDonationPackages()` or use existing `getPackages()` filtered by donation product IDs.
- In Donate screen: map preset $1/$5 to `donation_1`/`donation_5`, call `purchasePackage()`.
- For custom amount: either (a) round to nearest preset, or (b) show only presets and remove custom input until Stripe/different flow is added.
- **Recommendation:** Start with $1 and $5 only (matches current UI). Add $10, $25 later if needed.

**Files:** `app/(chakras)/Donate.tsx`, `src/services/revenuecat.ts`, `hooks/useRevenueCat.ts` (if needed).

---

## 2. EnergyExchange – Record & Share Your Journey

**Current:** VideoRecorderModal already records video and uses `Sharing.shareAsync()` – opens native share sheet (Instagram, etc.). No Firebase storage.

**Changes:**

- Update EnergyExchange copy: "Record & Share Your Journey" → e.g. "Send a love balm out to the world" or "Share your journey with the world."
- Update VideoRecorderModal share dialog title/copy to match.
- Ensure share message includes Soul School link (currently uses placeholder app store URLs – update to https://www.soulschool.app or community page when ready).
- **No code change needed for flow** – recording → native share sheet is already correct.

**Copy suggestions:**

- Button: "Send a Love Balm to the World"
- Subtitle: "Record a short video about your journey and share it on social media to inspire others."
- Share sheet: "Share Your Journey" (already used).

**Files:** `app/(chakras)/EnergyExchange.tsx`, `components/chakras/VideoRecorderModal.tsx` (share message/link).

---

## 3. Leave a Review – PENDING + Default URL

**Current:** `handleReview` has TODO, calls `handleBack()`.

**Changes:**

- Add constant `REVIEW_URL_PENDING = true` or similar (until App Store link exists).
- For now: `Linking.openURL("https://www.soulschool.app/community")`.
- When app is live: replace with App Store review URL (e.g. `https://apps.apple.com/app/idXXXXXX?action=write-review`).
- Document in code: "PENDING: Replace with App Store review URL when published."

**Files:** `app/(chakras)/EnergyExchange.tsx`, optionally `constants/sharing.ts`.

---

## 4. Write to Us – Styled Email Box

**Current:** `handleWriteToUs` has TODO, calls `handleBack()`.

**Changes:**

- Build a "Write to Us" modal or inline form in app style (gradients, transparencies, light).
- Fields: Subject (optional), Message body.
- "Send" opens `mailto:Asha@ProjectStarseed.org?subject=...&body=...`.
- Use `Linking.openURL()` with encoded subject and body.
- Style: LinearGradient, semi-transparent backgrounds, earth tones to match Donate/EnergyExchange.

**Options:**

- **A)** New screen `WriteToUs.tsx` – full page with form.
- **B)** Modal from EnergyExchange – "Write to Us" opens modal with form, Send opens mailto.
- **Recommendation:** Modal keeps user on EnergyExchange; simpler flow.

**Files:** New `components/chakras/WriteToUsModal.tsx` or similar, `app/(chakras)/EnergyExchange.tsx`.

---

## 5. Reflection Diary – Replace with Notes Along the Way

**Current:**

- **Notes Along the Way** (`app/(chakras)/NotesAlongTheWay.tsx`): Full diary with `useJourneyNotesStore`, add/edit notes by chakra day. Functional.
- **Reflection Diary Modal** (`ReflectionDiaryModal.tsx`): Opens when user taps feather (leaf) on a Community Hall comment. Shows "Reflection ID: {id}" – stub only.
- **Community Halls** reflections = social comments (Firestore). Notes Along the Way = personal notes (local store).

**User intent:** "Reflection diary might not be needed. Replace with notes along the way."

**Approach:**

- Remove ReflectionDiaryModal component and its usage.
- When user taps feather on a Community Hall comment: navigate to Notes Along the Way with that comment's `chakraDay` selected. This gives meaning to the feather: "Add your own notes for this day."
- Remove `ReflectionDiaryModal` import and `reflectionDiaryRef` / `selectedReflection` state from CommunityHallsScreen.
- Delete `components/social/ReflectionDiaryModal.tsx`.

**Alternative:** Remove feather entirely if redundant. User said "replace with notes along the way" – navigation to Notes is the intended behavior.

**Files:** `components/social/CommunityHallsScreen.tsx`, delete `components/social/ReflectionDiaryModal.tsx`.

---

## 6. EnergyExchange – Unhide Donate Option (Optional)

**Current:** Donate button is hidden (`{false && (...)}`).

**After Donation is wired:** Set to `true` to show "Support our mission" link to Donate screen.

---

## Implementation Order

1. **Leave a Review** – Quick: add Linking to soulschool.app/community, PENDING comment.
2. **Write to Us** – Build modal, mailto to Asha@ProjectStarseed.org.
3. **Record & Share** – Update copy only (flow already correct).
4. **Reflection Diary** – Remove modal, feather → navigate to Notes Along the Way.
5. **Donation** – Add RevenueCat donation products (requires App Store Connect setup first).

---

## Questions for User

1. **Donation custom amount:** App Store IAP requires fixed product IDs. Should we support only $1 and $5 for now, or add $10 and $25 presets?
2. **Record & Share copy:** Confirm final wording – "Send a love balm out to the world about this journey" or variant?
3. **Write to Us:** Modal vs full screen – preference?
4. **Feather behavior:** Navigate to Notes Along the Way with that day selected, or remove feather entirely?
