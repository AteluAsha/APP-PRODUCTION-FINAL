# iOS release position — 1.2.2 (44)

**Saved:** 2026-09-05  
**Status:** BUILD + SUBMIT IN FLIGHT — 1.2.2 (44), Xcode 26.2

Apple rejected **1.2.1 (43)** (errors 90062 / 90186): marketing version 1.2.1 is already approved and the train is closed. New train **1.2.2**, buildNumber **44**. Android Play stays **1.2.1 / versionCode 42**.

Wellness Gate hotfix: no repeat splash logo, pinned Enter the Sanctuary, one screen.

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.2 (44) — Wellness Gate enter CTA"
```
