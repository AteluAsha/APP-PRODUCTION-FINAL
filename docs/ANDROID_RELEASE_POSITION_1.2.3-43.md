# Android release position — 1.2.3 (43)

**Saved:** 2026-09-08  
**Status:** LOCAL AAB — Play production cut matching iOS 1.2.3 (45)

Marketing **1.2.3**. Native **versionCode 43**. Play consumed 36–41. **42** was reserved for the 1.2.1 Play cut that was never built; this train uses **43** so the Play number is unambiguously 1.2.3.

Same product as the iOS 1.2.3 (45) train: paid restore after uninstall, same-phone scholarship, cancelled-sub soft paywall, week-1 skip-if-opened nudges, Heart-player resume, and the “We’re listening” store-update card.

---

## Play release notes (paste in Play Console)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

---

## After this build

Artifact: `build-artifacts/SoulSchool-1.2.3-43.aab`

```bash
eas build -p android --profile production-local --local --non-interactive
```

Upload **this** file. Do not submit until versionName is 1.2.3 and versionCode is 43.
