# Welcome Screen – Production Locked

**Status:** LOCKED. This screen is the master design for production.

**Do not change** layout, overlay positions, typography, or content unless:
- Specifically requested by product, or
- Fixing bugs.

## Master implementation

- **File:** `app/(chakras)/WelcomeScreen.tsx`
- **Assets:** `Welcomeheader.png` (778×456), `WelcomeMain.png` (750×1000)

## Locked design (layers)

1. **Background:** Welcomeheader + WelcomeMain.png (card with “SEVEN CHAKRAS in SEVEN DAYS” strip).
2. **Black overlay:** Absolute box (left 5%, right 5%, top 35%, bottom 28%, borderRadius 12) over the paragraph region only. Renders in the same frame as the Image so the text behind never shows.
3. **Content:** One editable paragraph, Instrument Sans, fontSize 12, lineHeight 17, paddingHorizontal 14; specified phrases in InstrumentSansBold. Centered.
4. **Enter Path:** Transparent Pressable (bottom 52, centered, 200px circle). Visual play/logo is in WelcomeMain.png.

All overlay layers are hard-baked over the background (no conditional render, no delay) so the underlying image text never appears on open.
