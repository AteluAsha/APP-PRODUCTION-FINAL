# Android release position — 1.2.4 (44)

**Saved:** 2026-09-08  
**Status:** BUILDING — local Play AAB

Marketing **1.2.4**. Native **versionCode 44**. Play **1.2.3 / 43** stays in review. Do not reuse 43. Hold this AAB until 43 is approved (or cancelled), then roll 1.2.4 so users can skip noticing the in-flight cut.

Same product as iOS 1.2.4 (46): Anua streaming chat (chronological, italics/bold), plus Device ID already declared on Play Data Safety (SSAID for same-phone scholarship). Paid restore, scholarship, cancelled-sub soft paywall from 1.2.3 remain.

---

## Play release notes (paste in Play Console)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.2.4-44.aab`

```bash
eas build -p android --profile production-local --local --non-interactive --message "release(android): 1.2.4 (44) — Anua streaming chat"
```

Upload **this** file. Do not submit until versionName is 1.2.4 and versionCode is 44. Keep Data Safety **Device or other IDs** declared (App functionality, not linked, not used for tracking).
