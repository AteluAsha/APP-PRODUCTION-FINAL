# Android release position — 1.2.10 (52)

**Saved:** 2026-09-10  
**Status:** READY — local Play AAB

Marketing **1.2.10**. Native **versionCode 52**. Play already used **50**. Do not reuse 50 or 51.

iOS App Store train is **1.2.9 (51)** until the next iOS cut (**1.2.10 / 52** in `app.config.js`).

---

## This cut

- Full audio player stays quiet while a track saves in the background. Download MB / percent / “Preparing audio…” appear only if the save stalls, pauses, or errors.
- Hub Profile: Energy Exchange no longer covers the reminder switches.
- Gallery: swipe-back cannot dump the room; return-to-day sits under the plate, not on the flip.
- Goodbye: door line above the card; hero stands alone; plate locked to center.

---

## Play release notes (paste in Play Console)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.2.10-52.aab`

```bash
eas build -p android --profile production-local --local --non-interactive --output build-artifacts/SoulSchool-1.2.10-52.aab --message "release(android): 1.2.10 (52) — quiet player, goodbye gallery profile"
```

Upload **this** file. versionName 1.2.10, versionCode 52.
