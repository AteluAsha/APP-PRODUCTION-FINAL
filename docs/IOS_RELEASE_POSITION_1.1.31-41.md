# iOS release position — 1.1.31 (41)

**Saved:** 2026-09-03  
**Status:** READY TO BUILD TOMORROW — lockstep with Play 41

Play could not reuse versionCode 40. Tomorrow’s IPA is **1.1.31 / 41**.

```bash
eas build -p ios --profile production --non-interactive --message "release(ios): 1.1.31 (41) — App Store"
```

Same Apple checklist as the 1.1.30 park: export compliance off, `AppStoreID` 6760920862, `sdk-53`, Anua + store notice. Sign the ASC agreement before submit.
