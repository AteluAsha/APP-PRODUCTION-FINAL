# iOS release position — 1.1.27 (36)

**Saved:** 2026-09-02  
**Status:** BUILD DONE — submit blocked on App Store Connect agreement / account access

---

## Binary (ready — do not rebuild unless code changes)

| Field | Value |
|-------|-------|
| Version | **1.1.27** |
| Build number | **36** |
| Commit | `7345912` — `fix: align course copy per chakra and pin iOS EAS to sdk-53` |
| EAS build ID | `0a0ec404-ae6e-4124-b6a7-cbee75cee1a4` |
| Profile | `production` |
| Image | `sdk-53` (Xcode 16.4 — avoids fmt/Xcode 26 consteval failure) |
| Bundle ID | `com.sevenchakras.SevenChakras` |
| ASC App ID | `6760920862` |
| IPA | https://expo.dev/artifacts/eas/kvC1-weqmu1kwLTCbKrmLNsC986AC6WzHD6IldIEfEA.ipa |
| Build logs | https://expo.dev/accounts/theprofessor1111s-organization/projects/soul-school/builds/0a0ec404-ae6e-4124-b6a7-cbee75cee1a4 |

## What landed in this binary

- Course Sound Healing copy aligned per chakra/frequency (Throat = 741 Hz, not Root 396)
- Elemental `audioOutro` titles (Earth → Consciousness)
- `withFmtConstevalWorkaround` + EAS iOS pin to `sdk-53`
- Audio Library Clears/Brings + Hz via `getTuningForkHertz`

## Submit blocker (Apple — not code)

EAS submit fails with **Apple 403**: required App Store Connect agreement missing/expired.  
Account access also blocked from Sri Lanka (old USA phone / 2FA).

**When ASC access is restored:**

1. Sign pending agreements: App Store Connect → Business / Agreements, Tax, and Banking  
2. Either:
   ```bash
   eas submit -p ios --profile production --latest
   ```
   or download the IPA above and deliver with **Transporter** (Mac)

No new iOS build required unless further code changes after `7345912`.

## Last submit attempts (all failed on Apple agreement)

- `d6976fee-196e-4808-abdc-d6db96b3cacf`
- `3ca44fea-47cb-4022-872d-2ae8500e77e7`
- `c1a05f91-e2e6-489a-9f5f-babe60669aa9`
