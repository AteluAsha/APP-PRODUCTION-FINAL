# Android release position — 1.2.6 (46)

**Saved:** 2026-09-09  
**Status:** READY — local Play AAB

Marketing **1.2.6**. Native **versionCode 46**. Play **1.2.5 / 45** stays in review. Do not reuse 45.

Same product as iOS config 1.2.6 (48) when that cut ships. Do not rebuild iOS in this step.

---

## This cut

- Course-day / I Am Present no longer unmounts the Sanctuary navigator.
- Opening course explainer (Wellness Gate) is vertically centered on Android.
- Notifications: after Enter the Sanctuary, one Allow-communication prompt so Android 13+ can grant `POST_NOTIFICATIONS`. Daily noon + night-before slots on by default. Sunday 20:00 weekly always when permission is on. Tray alerts are no longer suppressed.

---

## Play release notes (paste in Play Console)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.2.6-46.aab`

```bash
eas build -p android --profile production-local --local --non-interactive --message "release(android): 1.2.6 (46) — crash recovery, gate, notifications"
```

Upload **this** file. Do not submit until versionName is 1.2.6 and versionCode is 46.
