# iOS release position — 1.2.4 (46)

**Saved:** 2026-09-08  
**Status:** QUEUED — upload after the 1.2.4 (44) Android AAB finishes

Live App Store is **1.2.2 (44)**. **1.2.3 (45)** is already on App Store Connect (Waiting for Review). This train is Anua streaming chat plus the Device ID privacy manifest (`NSPrivacyCollectedDataTypeDeviceID`, unlinked, not tracking, App Functionality). Play cut is **1.2.4 / versionCode 44**.

Hold 1.2.4 until 1.2.3 (45) is approved (or cancelled). Then submit/release this cut immediately so users can skip noticing 1.2.3. Auto-submit may fail while 1.2.3 is in review; the IPA should still land in TestFlight.

EAS uses `app.config.js` `ios.privacyManifests` (the local `ios/` tree is ignored by `.easignore`).

**App Store What’s New (paste in App Store Connect if auto-submit leaves it blank):**

We're listening. Little updates — for massive transformation. We love you all.

If anything feels unsettled after this update, uninstall and reinstall from the store. That clears the old and readies the new.

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.4 (46) — Anua streaming chat"
```
