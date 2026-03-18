# iOS parity: Welcome + trial waiting room + Clarity Moment

Apply the same design and placements on iOS as on Android (after the Android revert and Welcome spacing changes):

- **Welcome screen:** Same lower-box spacing (lineHeight 21, paragraph margin 20, line break after "and ends on Sunday") and padding as on Android.
- **Trial waiting room:** Same layout and final placements as Android: Build Your Tribe at previous position (ScrollView paddingBottom 72 for trial); no fixed bottom block; only PermanentMenuBar from root layout.
- **Clarity Moment:** The blue "For Deepest Embodiment" embodiment-audio box should live in the pop-up moment of clarity (ClarityMomentModal) on iOS, matching Android. On Android it already lives in `components/chakras/ClarityMomentModal.tsx`.

No code changes required for Android from this doc; this is a reminder for when implementing or verifying iOS.
