# Chakra Journey - Weekly Reset UX Alternatives

This document outlines alternative user experiences for handling the scenario where a user's weekly journey resets because they did not complete all 7 chakras in the previous week.

## Common Element: Modal 1 (First Reset Offer)

This modal appears **only** the _first_ time a user experiences a weekly reset due to incomplete progress.

- **Trigger:** `useChakraWeekTransition` detects the first reset (`weeklyResetCount` was 0 before the reset).
- **Title:** "A Fresh Start Awaits"
- **Body Text:** "Your journey progress resets weekly if all 7 chakras aren't explored. That's perfectly okay! **You have this full upcoming week, completely free,** to dive deep again. Complete the journey this time to unlock permanent access!"
- **Button 1:** `Continue Free Week` (Action: Dismiss modal, user continues with the new week)
- **Button 2:** `Unlock Full Access Now` (Action: Dismiss Modal 1, Open Modal 2)

## Common Element: Modal 2 (Unlock Options)

This modal presents the methods for gaining permanent access, bypassing weekly resets. It always includes payment and Energy Exchange options.

- **Trigger:** Varies depending on the alternative chosen below.
- **Title:** "Unlock Your Journey Permanently"
- **Body Text:** "Choose how you'd like to gain uninterrupted access to all chakra content, without the weekly resets:"
- **Option 1: Payment:** "$5 One-Time Purchase" button.
- **Option 2: Energy Exchange:** Grouped buttons for "Share Now", "Leave Review / Share", "Write to Us".
- **Unlock Action:** Any successful unlock sets `allChakrasCompleted = true` and dismisses the modal.

---

## Alternative Approaches for Subsequent Resets (Week 2+)

### Alternative 1: The Persistent Gentle Nudge (No Lockout)

- **Experience:** After the second reset (and any following resets), show **Modal 3**.
  - **Modal 3 Title:** "Unlock Your Full Journey"
  - **Modal 3 Body:** "Continuing your chakra journey unlocks deeper insights! Explore at your own pace without weekly resets by choosing full access."
  - **Modal 3 Button 1:** `Continue Weekly Journey` (Dismisses modal, user proceeds with reset week).
  - **Modal 3 Button 2:** `View Unlock Options` (Opens Modal 2).
- **Pros:** Very gentle, no pressure, always accessible.
- **Cons:** Weakest incentive to unlock, potentially repetitive.

### Alternative 2: Feature Limitation (Partial Lock)

- **Experience:** After the second reset, show a brief notification (e.g., Toast or simple alert) explaining the limitation. The app remains usable but only allows access to the first X (e.g., 3) chakras each week. A persistent banner/button on the main screen offers to "Unlock Full Journey", which opens Modal 2.
- **Pros:** Less jarring than full lock, allows continued (limited) engagement, provides tangible reason to unlock.
- **Cons:** More complex implementation (conditional chakra access), requires careful UI design for limited state and banner.

### Alternative 3: Increased Emphasis on Unlock (No Lockout)

- **Experience:** After the second reset (and any following resets), show **Modal 2** (Unlock Options) directly.
  - **Crucially:** Add a **Button 3:** `Maybe Later` / `Continue Weekly Journey` to Modal 2.
  - If "Maybe Later" is clicked, dismiss Modal 2, user proceeds with reset week.
- **Pros:** Clearly presents unlock options after grace period, stronger nudge than Alt 1, avoids hard lock, less complex than Alt 2.
- **Cons:** Presents the "ask" more forcefully/immediately after reset.

### Alternative 4: Time-Delayed Nudge/Lockout (Gradual Escalation)

- **Experience:**
  - **Week 1 Reset:** Modal 1 (Free Week Offer).
  - **Week 2 Reset:** Modal 3 (Gentle Nudge - see Alt 1).
  - **Week 3 Reset:** Modal 2 with "Maybe Later" button (Increased Emphasis - see Alt 3).
  - **Week 4+ Reset:** Implement the **original hard lockout**: Show Modal 2 _without_ a "Maybe Later" button. If dismissed without unlocking, show a dedicated **Locked Screen** that only allows reopening Modal 2.
- **Pros:** Very gradual escalation, gives multiple chances/warnings.
- **Cons:** Most complex state management (tracking the stage), delays unlock prompt significantly.
