# Firebase Setup for Voice Sanctuary

## 🔧 Required Configuration

### 1. Firestore Indexes

**Status**: ✅ Automated via `firestore.indexes.json`

**Deployment**:

```bash
# Using Firebase CLI
firebase deploy --only firestore:indexes

# Or manually: Firebase Console → Firestore → Indexes → Import from firestore.indexes.json
```

**Indexes Created**:

1. `chakraDay + moderationStatus + createdAt` (for feed queries)
2. `expiresAt` (for cleanup queries)
3. `userId + createdAt` (for user's own responses)

**Link to Create Indexes** (if Firebase CLI not available):

- Go to: https://console.firebase.google.com/project/soul-school-367ee/firestore/indexes
- Click "Import" and upload `firestore.indexes.json`

---

### 2. Firestore Security Rules

**Status**: ✅ Updated in `firestore.rules`

**Deployment**:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules

# Or manually: Firebase Console → Firestore → Rules → Copy from firestore.rules
```

**New Rules Added**:

- `voice_sanctuary_responses` collection
- Allows read for all users
- Allows create with validation (chakraDay 0-6, duration max 5min, etc.)
- Allows update only for `saveCount` field
- No manual deletes (lifecycle rules handle 7-day purge)

---

### 3. Firebase Storage Lifecycle Rules (7-Day Purge)

**Status**: ⚠️ Requires Firebase Console or CLI

**Option A: Firebase CLI (Recommended - Automated)**

```bash
# Deploy lifecycle rules
gsutil lifecycle set firebase-storage-lifecycle.json gs://soul-school-367ee.firebasestorage.app
```

**Option B: Firebase Console (Manual)**

1. Go to: https://console.firebase.google.com/project/soul-school-367ee/storage
2. Click on your storage bucket: `soul-school-367ee.firebasestorage.app`
3. Go to "Lifecycle" tab
4. Click "Add Rule"
5. Configure:
   - **Action**: Delete
   - **Condition**: Age ≥ 7 days
   - **Storage Class**: STANDARD
6. Save

**Lifecycle Rule Configuration** (from `firebase-storage-lifecycle.json`):

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "Delete" },
        "condition": {
          "age": 7,
          "matchesStorageClass": ["STANDARD"]
        }
      }
    ]
  }
}
```

**Note**: This applies to ALL files in the bucket. If you want to scope it to `voice-responses/` only, you'll need to use Cloud Functions instead (see Alternative below).

---

### 4. Firebase Storage Security Rules

**Status**: ✅ Created in `storage.rules`

**Deployment**:

```bash
# Using Firebase CLI
firebase deploy --only storage

# Or manually: Firebase Console → Storage → Rules → Copy from storage.rules
```

**New Rules Added**:

- `voice-responses/{chakraDay}/{fileName}` path
- Allows read for all users
- Allows write with validation (max 10MB, audio files only)
- No manual deletes (lifecycle rules handle 7-day purge)

---

### 5. Google Cloud Speech-to-Text API

**Status**: ⚠️ Requires API Key Configuration

**Setup Steps**:

1. Go to: https://console.cloud.google.com/apis/library/speech.googleapis.com
2. Enable "Cloud Speech-to-Text API" for your project
3. Go to: https://console.cloud.google.com/apis/credentials
4. Create API Key (or use existing)
5. Add to `.env` file:
   ```
   GOOGLE_CLOUD_SPEECH_API_KEY=your_api_key_here
   ```
6. Add to `app.config.js`:
   ```javascript
   extra: {
     // ... existing config ...
     googleCloudSpeechApiKey: process.env.GOOGLE_CLOUD_SPEUD_API_KEY || "",
   }
   ```

**Alternative**: If you don't want to use Google Cloud Speech-to-Text:

- The app will gracefully handle missing API key
- Responses will proceed without transcription
- Moderation will use audio analysis (when available) or approve by default

---

## ✅ Verification Checklist

- [ ] Firestore indexes deployed (`firestore.indexes.json`)
- [ ] Firestore rules updated (`firestore.rules`)
- [ ] Storage lifecycle rules configured (7-day purge)
- [ ] Storage security rules updated (`storage.rules`)
- [ ] Google Cloud Speech-to-Text API enabled (optional)
- [ ] API key added to `.env` and `app.config.js` (optional)

---

## 🚨 Important Notes

1. **Lifecycle Rules**: The 7-day purge applies to ALL files in the bucket. If you have other files that should NOT be deleted, consider:
   - Using Cloud Functions for scoped deletion (only `voice-responses/` path)
   - Or organizing other files in different paths with separate lifecycle rules

2. **Gemini API**: No special audio capability needed for MVP. Current Gemini 1.5 Pro API keys work for text-based moderation. Native audio analysis will be added in Phase 3.

3. **Transcription**: Optional but recommended. If not configured, responses will proceed without transcription (moderation will use audio analysis when available).

---

## 📋 Quick Deploy Commands

If you have Firebase CLI installed:

```bash
# Deploy everything at once
firebase deploy --only firestore:rules,firestore:indexes,storage

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage

# Deploy lifecycle rules separately (requires gsutil)
gsutil lifecycle set firebase-storage-lifecycle.json gs://soul-school-367ee.firebasestorage.app
```

---

## 🔗 Firebase Console Links

- **Firestore Indexes**: https://console.firebase.google.com/project/soul-school-367ee/firestore/indexes
- **Firestore Rules**: https://console.firebase.google.com/project/soul-school-367ee/firestore/rules
- **Storage Rules**: https://console.firebase.google.com/project/soul-school-367ee/storage/rules
- **Storage Lifecycle**: https://console.firebase.google.com/project/soul-school-367ee/storage (click bucket → Lifecycle tab)
- **Google Cloud Speech API**: https://console.cloud.google.com/apis/library/speech.googleapis.com
