# Security and Privacy Audit – Final Pre-Production

**Scope:** Global security check; customer data handling; openness and transparency.

---

## 1. Secrets and API Keys

### 1.1 Configuration (secure)

- **Source:** All API keys and secrets are loaded from **environment variables** in [app.config.js](app.config.js) (`process.env.*`). No keys are hardcoded in application code.
- **Build:** Development uses `.env` (optional, via dotenv). Production uses EAS Build environment variables. `.env` and `.env*.local` are in [.gitignore](.gitignore) and [.easignore](.easignore).
- **Exposed in app (by design):** Firebase client config, RevenueCat public SDK key, Stripe **publishable** key, Gemini API key(s), ElevenLabs API key, Google Cloud Speech key, Sentry DSN. These are client-side or “public” keys; security is enforced by backend, Firestore rules, and provider dashboards.
- **Never in app:** Stripe **secret** key. Comment in app.config.js: "Secret key is stored on backend, NOT in app." Payment verification should be done server-side (e.g. Supabase/Edge) using the secret key.

### 1.2 Critical fix applied: redact script

- **Issue:** [scripts/redact-stripe-keys.sh](scripts/redact-stripe-keys.sh) previously contained **live Stripe keys** (pk_live_... and sk_live_...) in plain text. Any copy of the repo or git history could expose them.
- **Fix:** Script was updated to use **pattern-based redaction** only. It no longer contains any real keys. It redacts any `pk_live_*` and `sk_live_*` strings in `.md` files.
- **Action required:** If the keys that were in the script were ever committed or shared, **rotate them in the Stripe dashboard** (issue new publishable and secret keys, update .env and backend env, then revoke the old keys).

---

## 2. Authentication and Identity

- **Clerk:** Referenced in .cursorrules for auth; **not present** in the codebase. The app does not use Clerk.
- **Actual identity:** Anonymous device/user identity via:
  - [src/services/userId.ts](src/services/userId.ts): Soul Signature (e.g. "Starseed | 1212:88") or legacy `user_*` ID, stored in AsyncStorage.
  - [src/services/soulSignature.ts](src/services/soulSignature.ts): Soul Signatures claimed in Firestore for uniqueness; no email/phone.
- **RevenueCat:** Linked to the same user ID for restore purchases; no email/name sent from app code (RevenueCat SDK may collect store-provided data per platform).
- **Firebase Auth:** Not used. Firestore rules reference `request.auth` in some places (e.g. sanctuary_user_data); if the app never signs in with Firebase Auth, those rules may block some updates. Social/tribe writes use unauthenticated create with validated payload shape.

---

## 3. Customer Data – Where It Lives and How It’s Handled

| Data | Where stored / sent | Security / openness |
|------|---------------------|----------------------|
| **User ID / Soul Signature** | AsyncStorage (device); Firestore `soul_signatures` (claimed); RevenueCat | Not PII; pseudonymous. |
| **Display name / avatar** | Local state (Zustand); Firestore `tribeRooms/.../members` when applying invite ref | User-chosen; stored in Firestore with open read rules (tribe members). |
| **Anua chat text** | Sent to Google Gemini API | User message content is sent to Gemini; no email/phone added by app. Privacy policy should state chat is processed by Google. |
| **Voice (Anua)** | Sent to ElevenLabs and/or Google (transcription) | Same as above; disclose in privacy policy. |
| **Reflections / tribe messages** | Firestore (social_sanctuary, tribes) | Stored with userId, chakraDay, message; anonymous option. Firestore rules validate shape; read open for some collections. |
| **Contacts** | [src/services/contactSync.ts](src/services/contactSync.ts): device only | Fetched only with permission; **not sent to any server**. `findFriendsOnApp` is a stub returning []. |
| **Invite ref / start date** | AsyncStorage | Used to link invitee to inviter in Firestore (displayName, profilePicUrl) when user applies invite. |
| **Payment / purchase** | RevenueCat (in-app); Stripe (web/backend) | RevenueCat handles Apple/Google payment data. Stripe: only session_id sent from app; verification must be server-side. |
| **Scholarship requests** | Firestore `scholarship_requests` | userId, reason, timestamp; create-only; read/update denied in rules. |

---

## 4. Error Tracking and Monitoring

- **Sentry:** [src/services/sentry.ts](src/services/sentry.ts) initializes with DSN from env; `beforeSend` can filter events. `setUser(id, email, username)` exists but is **never called** from the app, so no PII is set for Sentry. Exceptions are captured with optional context (e.g. service name); avoid passing user messages or PII in context.

---

## 5. Firestore Rules (summary)

- [firestore.rules](firestore.rules): Read/write rules are scoped per collection. Social and tribe data allow create with strict field checks; some paths allow read: true (public). No use of PII in rules. `sanctuary_user_data` and some updates require `request.auth != null`; if the app does not use Firebase Auth, those operations will fail until auth is introduced or rules are aligned.

---

## 6. Openness and Transparency

- **Paywall / legal:** [RevenueCatPaywall](components/chakras/RevenueCatPaywall.tsx) links to **Privacy Policy** (https://soulschool.app/privacy) and Terms. Good for store compliance and user transparency.
- **Recommendation:** Privacy policy should clearly state:
  - What data is collected (e.g. Soul Signature, display name, reflections, tribe messages, Anua chat).
  - That Anua conversations are processed by Google (Gemini) and optionally voice by ElevenLabs/Google.
  - That contacts are not uploaded (only used locally for “Find Friends” when implemented).
  - How to request account/data deletion (see below).

---

## 7. Account and Data Deletion

- **Current:** [src/services/deleteAccount.ts](src/services/deleteAccount.ts) clears local state: RevenueCat logout, remove userId from AsyncStorage, reset onboarding and presence (display name, profile image, location). It does **not** delete Firestore data (e.g. reflections, tribe members, soul_signatures).
- **Recommendation:** Document that “Delete account” clears app and purchase link only; Firestore data (e.g. reflections, tribe) may remain unless you add a backend/Cloud Function to delete or anonymize by userId. If you promise “delete my data” in the privacy policy, implement Firestore (and any other backend) deletion or anonymization.

---

## 8. Checklist – Secure and Open

- [x] No API secrets or Stripe secret key in app code; all from env.
- [x] .env and .env*.local gitignored and easignored.
- [x] Redact script no longer contains live Stripe keys; pattern-based redaction only.
- [x] Stripe verification (when implemented) must be server-side only.
- [x] Contacts: used only on device; not sent to server.
- [x] Sentry: no setUser with PII; careful with exception context.
- [x] Privacy policy linked from paywall.
- [ ] **Action:** Rotate Stripe keys if they were ever committed (e.g. in script or history).
- [ ] **Action:** Privacy policy explicitly covers Anua (Gemini/voice), reflections, tribe, and account deletion scope.
- [ ] **Optional:** Align Firestore rules with auth (or unauthenticated flows) and add server-side or CF for account/data deletion if promised.

---

**Conclusion:** Configuration and secrets handling are in good shape; customer data is handled with clear boundaries (no contacts upload, no PII to Sentry). The main fix was removing live Stripe keys from the redact script and switching to pattern-based redaction. For “secure and open,” rotate any exposed Stripe keys, and ensure the privacy policy and deletion behavior match user expectations and store requirements.
