# iOS release position — 1.1.30 (40)

**Saved:** 2026-09-03  
**Status:** SUPERSEDED — Play consumed 40. Tomorrow use **1.1.31 / 41** (`docs/IOS_RELEASE_POSITION_1.1.31-41.md`).

App Store live listing is still **1.1.3**. The parked 1.1.27 (36) IPA never landed (ASC agreement). Tomorrow’s IPA must be **1.1.30 / 40** to match Play.

---

## Tomorrow

From a clean `main` at HEAD (currently includes Anua + store notice + 1.1.30 / 40):

```bash
eas build -p ios --profile production --non-interactive --message "release(ios): 1.1.30 (40) — App Store"
```

EAS ignores the stale local `ios/` folder (`.easignore` `/ios/`). Prebuild reads `app.config.js`: version **1.1.30**, buildNumber **40**, `AppStoreID` **6760920862**, `ITSAppUsesNonExemptEncryption` **false**.

Then:

```bash
eas submit -p ios --profile production --latest
```

Last submit failed on a missing App Store Connect agreement. Sign Agreements, Tax, and Banking before submit, or use Transporter.

---

## In place for Apple

| Item | Status |
|------|--------|
| Marketing version / build | 1.1.30 / 40 — lockstep with Play |
| Bundle ID | `com.sevenchakras.SevenChakras` |
| ASC App ID | `6760920862` (iTunes lookup confirmed) |
| Export compliance | `ITSAppUsesNonExemptEncryption: false` |
| Privacy / Terms | soulschool.app/privacy on the paywall |
| Camera / mic / photos | Usage strings in `app.config.js` |
| Audio background | `UIBackgroundModes: audio` |
| EAS iOS image | `sdk-53` |
| Dist cert / profile | Active through Mar 2027 |
| Gemini (Anua) | Production EAS secrets present; model `gemini-3.6-flash` |
| Store-update notice | iOS uses iTunes lookup; fail closed; 24h grace |

---

## Same product as Play 40

- Anua on `gemini-3.6-flash`; hub toggle / notes / quiz on
- Quiet store-update offering if auto-update did not land
- Heart Day bowl v2 + vault orphan sweep
