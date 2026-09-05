# iOS release position — 1.2.1 (42)

**Saved:** 2026-09-05  
**Status:** READY TO BUILD — do not start until asked

Lockstep with Play: marketing **1.2.1**, buildNumber **42**. App Store live is still **1.1.3**.

```bash
eas build -p ios --profile production --non-interactive --message "release(ios): 1.2.1 (42) — App Store"
```

EAS ignores stale local `ios/` (`.easignore`). Prebuild reads `app.config.js`. Sign the ASC agreement before submit.

Store listing title can stay “Awakening Soul: 7 Chakras” until Apple changes it. In-app name is already **Awakening Soul**.
