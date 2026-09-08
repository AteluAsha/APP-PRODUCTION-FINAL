# iOS release position — 1.2.3 (45)

**Saved:** 2026-09-08  
**Status:** WAITING FOR REVIEW — 1.2.3 (45). Next public cut is 1.2.4 (46).

Live App Store is **1.2.2 (44)**. This train restores paid access after uninstall, same-phone scholarship, cancelled-sub soft paywall, week-1 skip-if-opened nudges, and Heart-player resume. Play cut is **1.2.3 / versionCode 43**.

Firestore `scholarship_devices` rules are deployed to `soul-school-367ee`.

**App Store What’s New (paste in App Store Connect if auto-submit leaves it blank):**

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.3 (45) — restore paid access after reinstall"
```
