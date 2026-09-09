# Android release position — 1.2.6 (46)

**Saved:** 2026-09-09  
**Status:** BUILDING — local Play AAB

Marketing **1.2.6**. Native **versionCode 46**. Play **1.2.5 / 45** stays in review. Do not reuse 45.

Critical: course-day / I Am Present no longer unmounts the Sanctuary navigator. Per-screen crash boundary, JS-thread presence navigation, duration-cache and persist guards.

Same product as iOS config 1.2.6 (48) when that cut ships. Do not rebuild iOS in this step.

---

## Play release notes (paste in Play Console)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.2.6-46.aab`

```bash
eas build -p android --profile production-local --local --non-interactive --message "release(android): 1.2.6 (46) — course-day crash recovery"
```

Upload **this** file. Do not submit until versionName is 1.2.6 and versionCode is 46.
