# iOS release position — 1.2.1 (43)

**Saved:** 2026-09-05  
**Status:** REJECTED BY APPLE — 1.2.1 train closed (90062 / 90186). Next cut is 1.2.2 (44).

Hotfix over 1.2.1 (42). Android Play stays **1.2.1 / versionCode 42**. App Store live is still **1.1.3**.

Opening Wellness Gate hid **Enter the Sanctuary** below the fold on iPhone (repeat splash logo + locked non-scrolling layout). Gate is now invitation + pinned CTA, one screen, shared paywall (first show after 1 hour).

```bash
eas build -p ios --profile production --non-interactive --auto-submit --message "release(ios): 1.2.1 (43) — Wellness Gate enter CTA"
```

EAS ignores stale local `ios/` (`.easignore`). Prebuild reads `app.config.js`.
