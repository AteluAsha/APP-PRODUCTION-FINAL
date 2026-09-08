# iOS release position — 1.2.3 (45)

**Saved:** 2026-09-08  
**Status:** BUILDING — 1.2.3 (45), Xcode 26.2

Live App Store is **1.2.2 (44)**. This train restores paid access after uninstall, same-phone scholarship, cancelled-sub soft paywall, week-1 skip-if-opened nudges, and Heart-player resume. Android Play stays **1.2.1 / versionCode 42**.

Firestore `scholarship_devices` rules are deployed to `soul-school-367ee`.

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.3 (45) — restore paid access after reinstall"
```
