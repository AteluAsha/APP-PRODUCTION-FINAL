# iOS release position — 1.2.6 (48)

**Saved:** 2026-09-09  
**Status:** SUBMITTING — production EAS + App Store auto-submit

Marketing **1.2.6**. Native **buildNumber 48**. App Store **1.2.5 (47)** is the previous train. Do not reuse 47.

Same product as Play **1.2.6 / versionCode 46**. EAS uses `app.config.js` (the local `ios/` tree is ignored by `.easignore`).

---

## This cut

- Course-day / I Am Present no longer unmounts the Sanctuary navigator.
- Opening course explainer (Wellness Gate) is vertically centered.
- Notifications: after Enter the Sanctuary, one Allow-communication prompt, then the system dialog. Daily noon + night-before slots on by default. Sunday 20:00 weekly always when permission is on. Banner/list alerts are no longer suppressed.

---

## App Store What’s New (paste if auto-submit leaves it blank)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.6 (48) — crash recovery, gate, notifications"
```
