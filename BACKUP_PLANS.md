# Backup Plans for Critical Systems

## 1. Firebase Storage Audio Backup Plan

### Current Implementation
- Audio files stored in Firebase Storage
- URLs fetched via `useEmbodimentAudio` hook
- Error handling displays error message if fetch fails

### Backup Strategy

#### Option A: Fallback to Local Audio Files (Recommended)
**Setup Required:**
1. Store backup audio files in `assets/audio/` directory
2. Create mapping: `CHAKRA_TO_FALLBACK_AUDIO` in `constants/chakras/audioFallbacks.ts`
3. Update `useEmbodimentAudio` to fallback to local files

**Implementation:**
```typescript
// If Firebase URL fails, use local file
if (error && fallbackAudio) {
  return { uri: require(`@/assets/audio/${fallbackAudio}`) }
}
```

**Pros:**
- Always works, even offline
- No additional setup needed
- Fast loading

**Cons:**
- Increases app bundle size (~50-100MB for all audio)
- Need to maintain two sets of audio files

#### Option B: CDN Backup (Recommended for Production)
**Setup Required:**
1. Upload audio files to CDN (Cloudflare, AWS CloudFront, etc.)
2. Store CDN URLs in Firestore as backup
3. Update `useEmbodimentAudio` to try CDN if Firebase fails

**Implementation:**
```typescript
// Try Firebase first, then CDN, then local
const audioUrl = await fetchFirebaseUrl()
  .catch(() => fetchCDNUrl())
  .catch(() => getLocalFallback())
```

**Pros:**
- Redundant storage
- Fast delivery
- No bundle size increase

**Cons:**
- Additional infrastructure cost
- Need to sync files between Firebase and CDN

#### Option C: Graceful Degradation with User Notification
**Setup Required:**
1. Enhanced error messages
2. "Retry" button
3. Option to download audio for offline use

**Implementation:**
- Show friendly message: "Audio temporarily unavailable. Please check your connection."
- Add "Retry" button
- Add "Download for Offline" option (future feature)

**Pros:**
- No additional setup
- User-friendly

**Cons:**
- Audio unavailable if Firebase is down

### Recommended: Hybrid Approach
1. **Primary:** Firebase Storage (current)
2. **Backup:** Local fallback files for critical audio (intro meditations)
3. **Fallback:** CDN URLs stored in Firestore
4. **User Experience:** Clear error messages with retry option

---

## 2. Gemini API (Anua) Backup Plan

### Current Implementation
- Uses Google Gemini API for Anua responses
- Error handling shows error message if API fails
- Voice synthesis via ElevenLabs

### Backup Strategy

#### Option A: Cached Responses (Recommended)
**Setup Required:**
1. Store common responses in Firestore `anua_responses` collection
2. Cache responses by chakra day and question type
3. Fallback to cached responses if API fails

**Implementation:**
```typescript
// Try API first, then cached responses
const response = await askAnua(question)
  .catch(() => getCachedResponse(chakraDay, questionType))
  .catch(() => getDefaultResponse(chakraDay))
```

**Pros:**
- Works offline
- Fast responses
- No API costs for cached queries

**Cons:**
- Need to pre-populate cache
- Responses may be less personalized

#### Option B: Multiple API Keys (Recommended for Production)
**Setup Required:**
1. Store multiple Gemini API keys in environment variables
2. Rotate keys if quota exceeded
3. Fallback to secondary key if primary fails

**Implementation:**
```typescript
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
]

// Try each key in sequence
for (const key of API_KEYS) {
  try {
    return await askAnuaWithKey(question, key)
  } catch (error) {
    continue // Try next key
  }
}
```

**Pros:**
- Handles quota limits
- Redundant API access

**Cons:**
- Multiple API accounts needed
- Additional cost

#### Option C: Pre-Generated Response Library
**Setup Required:**
1. Generate responses for common questions using Gemini
2. Store in Firestore `anua_response_library` collection
3. Match user questions to library responses

**Implementation:**
- Use semantic search to find closest match
- Return library response if match found
- Fallback to API if no match

**Pros:**
- Always works
- Consistent responses
- No API costs

**Cons:**
- Less dynamic
- Need to maintain library

#### Option D: Graceful Degradation
**Setup Required:**
1. Enhanced error messages
2. "Try Again" button
3. Pre-written responses for common scenarios

**Implementation:**
```typescript
if (apiError) {
  return {
    text: "I'm having trouble connecting right now. Here's some wisdom for your journey today...",
    isFallback: true
  }
}
```

**Pros:**
- No additional setup
- User-friendly

**Cons:**
- Limited functionality if API is down

### Recommended: Multi-Layer Approach
1. **Primary:** Gemini API (current)
2. **Backup 1:** Cached responses in Firestore
3. **Backup 2:** Pre-generated response library
4. **Backup 3:** Pre-written wisdom for each chakra day
5. **User Experience:** Clear messaging when using fallback

---

## 3. Firestore Indexes Backup Plan

### Current Implementation
- `getTopReflections` requires composite index
- Error handling returns empty array if index missing

### Backup Strategy

#### Option A: Create Index Programmatically (Not Possible)
- Firestore indexes must be created in Firebase Console
- Cannot be created via code

#### Option B: Simplified Query (Recommended)
**Setup Required:**
1. Modify query to not require composite index
2. Fetch all reflections, sort in memory
3. Limit to top 2 client-side

**Implementation:**
```typescript
// Instead of: orderBy('timestamp').limit(2)
// Use: Fetch all, sort client-side, take top 2
const allReflections = await getReflectionsForDay(day, 100)
const topReflections = allReflections
  .sort((a, b) => b.timestamp - a.timestamp)
  .slice(0, 2)
```

**Pros:**
- No index required
- Works immediately

**Cons:**
- Less efficient for large datasets
- Fetches more data than needed

#### Option C: Pre-Create Index (Recommended for Production)
**Setup Required:**
1. Create index in Firebase Console
2. Document index creation in `FIREBASE_INDEX_SETUP.md`
3. Include in deployment checklist

**Implementation:**
- Index: `social_sanctuary` collection
- Fields: `chakraDay` (Ascending), `timestamp` (Descending)
- Query scope: Collection

**Pros:**
- Most efficient
- Best performance

**Cons:**
- Requires manual setup
- Index creation can take time

#### Option D: Use Single Field Index
**Setup Required:**
1. Query by `chakraDay` only
2. Sort by `timestamp` client-side
3. No composite index needed

**Implementation:**
```typescript
// Query by chakraDay only (single field index)
const query = collection(db, 'social_sanctuary')
  .where('chakraDay', '==', day)
  .where('parentId', '==', null) // Top-level only

// Sort client-side
const sorted = results.sort((a, b) => b.timestamp - a.timestamp)
```

**Pros:**
- No composite index needed
- Single field indexes are auto-created

**Cons:**
- Less efficient for large datasets

### Recommended: Hybrid Approach
1. **Primary:** Use simplified query (no composite index)
2. **Optimization:** Create composite index in Firebase Console for production
3. **Fallback:** Client-side sorting if query fails
4. **Documentation:** Clear setup instructions in `FIREBASE_INDEX_SETUP.md`

---

## 4. Network Connectivity Backup Plan

### Current Implementation
- Firestore offline persistence enabled (100MB cache)
- Audio may not be cached

### Backup Strategy

#### Option A: Enhanced Offline Persistence (Recommended)
**Setup Required:**
1. Increase Firestore cache size
2. Enable persistent audio caching
3. Pre-cache critical content

**Implementation:**
```typescript
// Firestore config
const firestoreSettings = {
  cacheSizeBytes: 200 * 1024 * 1024, // 200MB
  enablePersistence: true,
}

// Audio caching
import * as FileSystem from 'expo-file-system'
const audioCache = FileSystem.cacheDirectory + 'audio/'
```

**Pros:**
- Works fully offline
- Better user experience

**Cons:**
- Increased storage usage
- Need to manage cache size

#### Option B: Download for Offline Feature
**Setup Required:**
1. Add "Download for Offline" button to audio players
2. Store downloaded audio in device storage
3. Check for downloaded files before fetching from network

**Implementation:**
```typescript
// Check for downloaded file first
const localFile = await FileSystem.getInfoAsync(audioCache + audioId)
if (localFile.exists) {
  return { uri: localFile.uri }
}
// Otherwise fetch from network
```

**Pros:**
- User controls what to download
- Saves bandwidth

**Cons:**
- Additional feature to implement
- Storage management needed

#### Option C: Pre-Cache Critical Content
**Setup Required:**
1. Download critical audio on app launch
2. Store in device cache
3. Use cached versions if network unavailable

**Implementation:**
```typescript
// On app launch, pre-cache intro meditations
const criticalAudio = [
  'Day1_RootChakraEmbodiment_SoulSchool.aac',
  'Day2_SacralChakraEmbodiment_SoulSchool.aac',
  // ... etc
]

for (const audio of criticalAudio) {
  await downloadAndCache(audio)
}
```

**Pros:**
- Critical content always available
- Better offline experience

**Cons:**
- Initial download time
- Storage usage

#### Option D: Graceful Offline Mode
**Setup Required:**
1. Detect network status
2. Show offline indicator
3. Disable features that require network
4. Show cached content only

**Implementation:**
```typescript
import NetInfo from '@react-native-community/netinfo'

const isConnected = await NetInfo.fetch().then(state => state.isConnected)

if (!isConnected) {
  // Show offline mode
  // Only show cached content
  // Disable Anua chat, community posting
}
```

**Pros:**
- Clear user feedback
- Prevents errors

**Cons:**
- Limited functionality offline

### Recommended: Multi-Layer Approach
1. **Primary:** Firestore offline persistence (current - 100MB)
2. **Enhancement:** Increase cache to 200MB
3. **Audio:** Implement FileSystem caching for audio files
4. **Pre-Cache:** Download critical audio on first launch
5. **User Experience:** Clear offline indicators and graceful degradation

---

## Implementation Priority

### High Priority (Implement First)
1. **Firestore Indexes:** Use simplified query (no composite index needed)
2. **Network Connectivity:** Increase Firestore cache, add audio caching
3. **Gemini API:** Add cached responses in Firestore

### Medium Priority (Implement Next)
1. **Firebase Storage Audio:** Add local fallback files for critical audio
2. **Gemini API:** Pre-generate response library
3. **Network Connectivity:** Add "Download for Offline" feature

### Low Priority (Future Enhancements)
1. **Firebase Storage Audio:** CDN backup
2. **Gemini API:** Multiple API keys rotation
3. **Network Connectivity:** Pre-cache all content

---

## Redundant Setup Requirements

### For Firebase Storage Audio:
- ✅ **Current:** Firebase Storage
- 🔄 **Backup 1:** Local audio files in `assets/audio/` (you need to add these)
- 🔄 **Backup 2:** CDN URLs in Firestore (optional, for production)

### For Gemini API:
- ✅ **Current:** Single API key
- 🔄 **Backup 1:** Cached responses in Firestore (I'll implement)
- 🔄 **Backup 2:** Multiple API keys in `.env` (you need to add `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`)
- 🔄 **Backup 3:** Pre-generated response library in Firestore (I'll implement)

### For Firestore Indexes:
- ✅ **Current:** Composite index (manual setup in Firebase Console)
- 🔄 **Backup:** Simplified query (no index needed - I'll implement)

### For Network Connectivity:
- ✅ **Current:** Firestore offline persistence (100MB)
- 🔄 **Enhancement:** Increase to 200MB (I'll implement)
- 🔄 **Enhancement:** Audio FileSystem caching (I'll implement)

---

## Next Steps

1. **I'll implement:**
   - Simplified Firestore query (no index needed)
   - Increased Firestore cache
   - Audio FileSystem caching
   - Cached Anua responses in Firestore
   - Pre-generated response library structure

2. **You need to provide:**
   - Local audio files for fallback (optional, but recommended)
   - Additional Gemini API keys (optional, for production)
   - CDN setup (optional, for production)

3. **We'll test:**
   - Offline mode functionality
   - Error handling
   - Fallback mechanisms
   - User experience

