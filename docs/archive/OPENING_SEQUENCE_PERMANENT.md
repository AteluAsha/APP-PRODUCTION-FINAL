# Permanent Opening Sequence

## Hard Baked Rule

**Splash → Welcome Path Selection. ALWAYS. Every single app open.**

This sequence trumps all other logic (timegate, lifetime access, etc.).

## Do Not Bypass

**`hasCompletedHeroOnboarding`, `courseStartDate`, or any other flag must NEVER be used to skip WelcomeScreen.** Path selection is the universal entry point. Index always routes to WelcomeScreen after rehydration. No conditional bypass.

## Implementation

- **`app/(chakras)/index.tsx`**: After rehydration, ALWAYS routes to `WelcomeScreen`. No conditional bypass.
- **`app/(chakras)/WelcomeScreen.tsx`**: Path selection. Enter Path → `ChakraHub` (lifetime) or `DateSelection` (trial).

## Flow After Path Selection

| User State     | WelcomeScreen → | Then                                          |
| -------------- | --------------- | --------------------------------------------- |
| Lifetime       | ChakraHub       | Full access, no timegate                      |
| Trial (new)    | DateSelection   | Pick date → ChakraHome → WaitingScreen        |
| Trial (post-2) | DateSelection   | Begin → ChakraHome → CommitmentGate (paywall) |

## What Comes After

- **Timegate** (`src/services/timegate.ts`): Applies only in ChakraHome, WaitingScreen, etc. Never at app entry.
- **Lifetime access**: Checked after path selection. WelcomeScreen routes to ChakraHub for lifetime users.
- **CommitmentGate**: Shown by ChakraHome when `shouldShowCommitmentGate` (post-trial 2).

## Future: Multiple Courses

When the app has more courses, Welcome Path Selection will be the universal entry. User always picks which path/course to enter. Timegate and access logic apply per path.

## Future: Text Overlay on WelcomeMain.png

For production accessibility/localization: Replace the main body text on WelcomeMain.png with a black text overlay.

- Overlay a black/semi-opaque box over the image
- Render the same words with matching font size and bolding
- Preserve layout (bolds vs non-bolds) as in the current design
- Do not implement now; document for later
