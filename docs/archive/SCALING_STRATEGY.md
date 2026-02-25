# Heavy-Traffic Scaling Strategy

## Current Setup

- **Firestore:** 200MB offline persistence; reads use cache when available
- **Rate limits:** Gemini 60/min, ElevenLabs 30/min, Firebase 150/min (per device)
- **API resilience:** `robustApiCall`, timeout, retry, deduplication in place

## Scaling Readiness

1. **Firestore** – Auto-scales; 200MB cache reduces redundant reads
2. **External APIs** – Rate limits protect quota; backend capacity is the constraint
3. **AsyncStorage** – Per-device; no server-side session management

## For 10x Traffic

- Monitor Firestore usage in Firebase Console
- If hot-path reads spike: consider Cloud Functions for caching
- Rate limits are per-device; total traffic scales with user count
