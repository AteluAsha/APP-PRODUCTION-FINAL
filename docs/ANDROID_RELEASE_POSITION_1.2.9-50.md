# Android release position — 1.2.9 (50)

**Saved:** 2026-09-10  
**Status:** READY — local Play AAB

Marketing **1.2.9**. Native **versionCode 50**. Play already used **49**. Do not reuse 49.

iOS App Store train remains **1.2.8 (50)** until the next iOS cut (**1.2.9 / 51** in `app.config.js`). Do not submit this AAB as 1.2.8.

---

## This cut

- Goodbye: reserved layout so the reveal does not jump; door line fades first, then ball, then I Am. Home is a large footer button, clear of the reminders switch.
- Gallery: full-size plate that flips to the reading; back unturns before leaving. Notice copy and “I am open to Receive.”
- Embodiment gate: space under remaining paths; Sovereignty Bypass is its own button.
- Hub Profile: Daily alignment reminders visible at the bottom; Energy Exchange has breathing room.
- Crown reminder waits until tomorrow’s card is dismissed.

---

## Play release notes (paste in Play Console)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.2.9-50.aab`

```bash
eas build -p android --profile production-local --local --non-interactive --output build-artifacts/SoulSchool-1.2.9-50.aab --message "release(android): 1.2.9 (50) — goodbye gallery profile polish"
```

Upload **this** file. versionName 1.2.9, versionCode 50.
