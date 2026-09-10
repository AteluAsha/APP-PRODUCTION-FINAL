# iOS release position — 1.2.8 (50)

**Saved:** 2026-09-09  
**Status:** SUBMITTING — production EAS + App Store auto-submit

Marketing **1.2.8**. Native **buildNumber 50**. App Store Connect already used **49** on the 1.2.7 train. Do not reuse 49.

Same product as Play **1.2.8 / versionCode 49**. EAS uses `app.config.js` (the local `ios/` tree is ignored by `.easignore`).

---

## This cut

- Crystal bowl first-download play: hand off the growing `.part` so listening does not freeze; finished files play start to finish with no handoff path.
- Gallery of Alignment, goodbye close, embodiment gate, and course-day open from the prior train.

---

## App Store What’s New (paste if auto-submit leaves it blank)

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.8 (50) — crystal bowl first-download play"
```
