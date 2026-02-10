# Tribe Chat Friend Management System - Implementation Plan

## Overview
Transform Tribe Chat into a comprehensive friend management system with contact syncing, friend lists, and a dedicated "Add to Room" modal that replaces the current "Build Your Tribe" flow.

---

## Phase 1: New "Add to Room" Modal

### 1a. Create `TribeRoomInviteModal.tsx`
**Goal:** Replace `InviteFriendModal` usage in Tribe Chat with a simpler, room-focused invite modal.

**Design:**
- **Title:** "Add to Room"
- **Subtitle:** "You can add your people to this room and share the space as you unfold."
- **Actions:**
  - Share invite link (native Share API)
  - Copy link to clipboard
  - [Future] Select from contacts (Phase 2)
- **Styling:** Dark background, sage green gradients, depth with LinearGradient

**Implementation:**
```typescript
// components/tribe/TribeRoomInviteModal.tsx
interface TribeRoomInviteModalProps {
  visible: boolean
  onClose: () => void
  roomId: string // e.g., "global-trial-tribe"
  onInviteSent?: () => void
}
```

**Key Differences from InviteFriendModal:**
- Simpler copy focused on "room" concept
- No "Build Your Tribe" branding
- Specific to Tribe Chat context
- Will integrate contact picker in Phase 2

---

## Phase 2: Contact Syncing with expo-contacts

### 2a. Install and Configure expo-contacts
**Installation:**
```bash
npx expo install expo-contacts
```

**iOS Configuration (app.config.js):**
```javascript
plugins: [
  // ... existing plugins
  [
    "expo-contacts",
    {
      contactsPermission: "Allow Soul School to find friends who are also on the journey."
    }
  ]
]
```

**Android Configuration (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.READ_CONTACTS"/>
```
(No WRITE_CONTACTS needed - read-only)

**After config:** Run `npx pod-install` for iOS

### 2b. Create Contact Sync Service
**Goal:** Safe, permission-aware contact access with user matching.

**File:** `src/services/contactSync.ts`

**Key Functions:**
```typescript
// Request permission (runtime)
async function requestContactsPermission(): Promise<boolean>

// Get all contacts with phone numbers and emails
async function getDeviceContacts(): Promise<Contact[]>

// Match device contacts against app users (via backend/Firestore)
async function findFriendsOnApp(contacts: Contact[]): Promise<AppUser[]>

// Normalize phone numbers for matching (remove formatting)
function normalizePhoneNumber(phone: string): string
```

**Privacy & Performance:**
- Only request permission when user taps "Find Friends" or similar
- Cache results to avoid repeated permission prompts
- Send hashed phone/email to backend for matching (privacy-first)
- Limit to 500 contacts max to avoid performance issues

### 2c. Backend Contact Matching
**Firestore Structure:**
```
users/
  {userId}/
    phoneHash: "sha256_hash_of_phone"
    emailHash: "sha256_hash_of_email"
    displayName: "First Name"
    profilePicUrl: "..."
```

**Matching Logic:**
1. Client hashes all contact phone numbers and emails (SHA-256)
2. Client sends hashes to Cloud Function or queries Firestore
3. Backend returns matching users (userId, displayName, profilePic)
4. Client displays "Friends on Soul School" list

**Security:**
- Never store raw phone numbers in Firestore
- Use hashed values for matching
- Rate limit contact sync requests (1 per hour per user)

---

## Phase 3: Friend Management UI (Hamburger Menu)

### 3a. Create `TribeFriendsMenu.tsx`
**Goal:** Slide-out menu (or bottom sheet) for managing friends in the room.

**Trigger:** Hamburger icon in Tribe Chat header (next to people-outline icon)

**Menu Sections:**

#### **Your Profile**
- Profile picture (editable)
- Display name (editable)
- User ID (read-only, copyable)

#### **Friends in Room**
**Tabs:**
1. **Connected** (actively chatting)
   - Avatar + name
   - "Remove from room" option (with confirmation)
   - Last active timestamp

2. **Pending** (invited, not yet joined)
   - Name (if known) or "Pending invite"
   - Resend invite button
   - Cancel invite button

3. **Suggested** (contacts on app, not in room)
   - Avatar + name + "On Soul School"
   - "Add to room" button
   - Only shown after contact sync

#### **Actions**
- **+ Invite More** → Opens `TribeRoomInviteModal`
- **Find Friends** → Triggers contact sync (if not done) → Shows suggested friends

**Design:**
- Slide from right (like drawer)
- Dark background with gradient depth
- Sage green accents for active states
- Smooth animations (react-native-reanimated)

### 3b. Update Tribe Chat Header
**Changes:**
- Add hamburger icon (left of people-outline icon)
- Hamburger opens `TribeFriendsMenu`
- People-outline icon still opens `TribeRoomInviteModal` (quick invite)

**Layout:**
```
[X Close] [Tribe / chat] ... [☰ Menu] [👥 Invite]
```

---

## Phase 4: Friend State Management

### 4a. Extend `useChakraJourneyStore.ts`
**New State:**
```typescript
interface ChakraJourneyState {
  // ... existing state
  
  // Tribe Chat Friends
  tribeFriends: {
    connected: TribeFriend[]    // Friends actively in room
    pending: TribeFriend[]       // Invited, not yet joined
    suggested: TribeFriend[]     // Contacts on app, not in room
  }
  
  // Contact Sync
  contactSyncCompleted: boolean
  contactSyncLastRun: string | null // ISO timestamp
  
  // Actions
  addTribeFriend: (friend: TribeFriend, status: 'connected' | 'pending') => void
  removeTribeFriend: (friendId: string) => void
  updateFriendStatus: (friendId: string, status: 'connected' | 'pending') => void
  setSuggestedFriends: (friends: TribeFriend[]) => void
  setContactSyncCompleted: (completed: boolean) => void
}

interface TribeFriend {
  id: string              // userId or inviteId
  displayName: string
  profilePicUrl?: string
  phoneHash?: string      // For matching
  emailHash?: string      // For matching
  invitedAt?: string      // ISO timestamp
  joinedAt?: string       // ISO timestamp
  lastActiveAt?: string   // ISO timestamp
}
```

**Persistence:**
- Store in AsyncStorage via Zustand persist
- Sync with Firestore for real-time updates

### 4b. Create `useTribeFriends.ts` Hook
**Goal:** Real-time friend list updates from Firestore.

**Firestore Structure:**
```
tribeRooms/
  {roomId}/
    members/
      {userId}/
        displayName: "First Name"
        profilePicUrl: "..."
        status: "connected" | "pending"
        invitedBy: "userId"
        invitedAt: timestamp
        joinedAt: timestamp | null
        lastActiveAt: timestamp
```

**Hook Functions:**
```typescript
function useTribeFriends(roomId: string) {
  const { connected, pending, loading, error } = // ... Firestore listener
  
  const inviteFriend = async (friendId: string) => { /* ... */ }
  const removeFriend = async (friendId: string) => { /* ... */ }
  const updateLastActive = async () => { /* ... */ }
  
  return { connected, pending, loading, error, inviteFriend, removeFriend, updateLastActive }
}
```

---

## Phase 5: Contact Picker Integration

### 5a. Add Contact Picker to `TribeRoomInviteModal`
**New Button:** "Choose from Contacts"

**Flow:**
1. User taps "Choose from Contacts"
2. Request contacts permission (if not granted)
3. Show contact picker (native or custom)
4. User selects contact(s)
5. Check if contact is on Soul School (via backend matching)
6. If yes: Add to "Suggested" and show "Add to room" button
7. If no: Show "Invite to Soul School" with Share API

**Implementation:**
```typescript
// In TribeRoomInviteModal
const handleChooseFromContacts = async () => {
  const hasPermission = await requestContactsPermission()
  if (!hasPermission) {
    // Show permission denied message
    return
  }
  
  const contacts = await getDeviceContacts()
  const friendsOnApp = await findFriendsOnApp(contacts)
  
  if (friendsOnApp.length > 0) {
    // Show "Friends on Soul School" list
    setSuggestedFriends(friendsOnApp)
  } else {
    // Show "None of your contacts are on Soul School yet" message
    // Offer to invite via Share API
  }
}
```

### 5b. Contact Picker UI
**Option 1:** Native Contact Picker (iOS/Android)
- Use `expo-contacts.presentFormAsync()` (if available)
- Pros: Native UI, familiar to users
- Cons: Limited customization

**Option 2:** Custom Contact List
- Fetch contacts with `expo-contacts.getContactsAsync()`
- Display in custom modal with search
- Pros: Full control, app-styled
- Cons: More implementation work

**Recommendation:** Start with custom list for consistency with app design.

---

## Phase 6: Profile Management

### 6a. Create `TribeProfileEditor.tsx`
**Goal:** Edit profile from Friends Menu.

**Editable Fields:**
- Display name (first name or nickname)
- Profile picture (camera or photo library)
- Bio (optional, 100 chars max)

**Implementation:**
- Use `expo-image-picker` for profile picture
- Upload to Firebase Storage
- Update Firestore user document
- Update local Zustand store

### 6b. User ID Display
**Goal:** Show user's unique ID for manual friend adding.

**Format:** `soul-school-{userId}` (e.g., `soul-school-abc123`)

**Actions:**
- Copy to clipboard
- Share via native Share API

**Use Case:** Users can share their ID via text/email for manual friend adding.

---

## Phase 7: Real-Time Chat Enhancements

### 7a. Typing Indicators
**Goal:** Show when friends are typing.

**Implementation:**
- Add `typing` field to Firestore room document
- Update on TextInput change (debounced)
- Display "Friend is typing..." below chat

### 7b. Read Receipts
**Goal:** Show when messages are read.

**Implementation:**
- Add `readBy` array to each message document
- Update when message scrolls into view
- Display checkmarks or "Read by X" below message

### 7c. Friend Presence
**Goal:** Show online/offline status.

**Implementation:**
- Use Firestore `onDisconnect()` for presence
- Update `lastActiveAt` timestamp on activity
- Display green dot for "online" (active < 5 min ago)

---

## Phase 8: Testing & Edge Cases

### 8a. Permission Handling
**Test Cases:**
- User denies contacts permission → Show helpful message
- User grants permission later → Re-trigger contact sync
- iOS vs Android permission flows

### 8b. Contact Matching
**Test Cases:**
- No contacts on app → Show "Invite friends" message
- Multiple contacts on app → Display all in suggested list
- Contact phone number formats (international, etc.)

### 8c. Friend Limits
**Considerations:**
- Max friends per room? (e.g., 10 for trial, unlimited for lifetime)
- Max pending invites? (e.g., 20)
- Rate limiting for invites (prevent spam)

### 8d. Offline Behavior
**Handling:**
- Cache friend list locally
- Queue invite actions when offline
- Sync when back online

---

## Implementation Order (Recommended)

### Sprint 1: Core Modal & UI
1. Create `TribeRoomInviteModal.tsx` (Phase 1)
2. Update `TribeChatContent.tsx` to use new modal
3. Add hamburger icon to header (Phase 3b)
4. Create basic `TribeFriendsMenu.tsx` shell (Phase 3a)

### Sprint 2: State Management
5. Extend `useChakraJourneyStore.ts` with friend state (Phase 4a)
6. Create `useTribeFriends.ts` hook (Phase 4b)
7. Wire up Firestore listeners for real-time updates

### Sprint 3: Contact Syncing
8. Install and configure `expo-contacts` (Phase 2a)
9. Create `contactSync.ts` service (Phase 2b)
10. Implement backend contact matching (Phase 2c)
11. Add "Find Friends" button to Friends Menu

### Sprint 4: Contact Picker
12. Add contact picker to `TribeRoomInviteModal` (Phase 5a)
13. Build custom contact list UI (Phase 5b)
14. Test contact matching flow end-to-end

### Sprint 5: Profile & Polish
15. Create `TribeProfileEditor.tsx` (Phase 6a)
16. Add user ID display and copy (Phase 6b)
17. Implement typing indicators (Phase 7a)
18. Add read receipts (Phase 7b)

### Sprint 6: Testing & Launch
19. Comprehensive testing (Phase 8)
20. Performance optimization
21. Analytics tracking
22. Production deployment

---

## Technical Considerations

### Security
- **Hash phone numbers/emails** before sending to backend (SHA-256)
- **Never store raw contact data** in Firestore
- **Rate limit** contact sync requests (1 per hour per user)
- **Validate** all friend actions server-side (Cloud Functions)

### Performance
- **Limit contact fetch** to 500 contacts max
- **Debounce** typing indicators (500ms)
- **Paginate** friend lists if > 50 friends
- **Cache** contact sync results for 24 hours

### Privacy
- **Request permission** only when needed (not on app launch)
- **Explain** why contacts are needed in permission prompt
- **Allow** users to skip contact sync (manual invite only)
- **Provide** opt-out for contact matching in settings

### Cross-Platform
- **Test** on both iOS and Android (different permission UIs)
- **Handle** different contact formats (phone number formatting)
- **Account** for iOS contact groups vs Android flat list

---

## Files to Create

### New Components
- `components/tribe/TribeRoomInviteModal.tsx`
- `components/tribe/TribeFriendsMenu.tsx`
- `components/tribe/TribeProfileEditor.tsx`
- `components/tribe/ContactPicker.tsx`
- `components/tribe/FriendListItem.tsx`

### New Services
- `src/services/contactSync.ts`
- `src/services/friendMatching.ts` (backend logic)

### New Hooks
- `hooks/useTribeFriends.ts`
- `hooks/useContactSync.ts`

### New Types
- `types/tribe/TribeFriend.ts`
- `types/tribe/TribeRoom.ts`

### Backend (Cloud Functions)
- `functions/matchContactsWithUsers.ts`
- `functions/inviteFriendToRoom.ts`
- `functions/removeFriendFromRoom.ts`

---

## Success Metrics

### User Engagement
- % of users who sync contacts
- % of users who find friends on app
- % of users who invite friends
- Average friends per room

### Technical
- Contact sync success rate
- Permission grant rate (iOS vs Android)
- Contact matching accuracy
- Real-time message delivery latency

### Business
- Viral coefficient (invites sent per user)
- Friend-to-user conversion rate
- Retention lift from friend usage

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on user feedback
3. **Create Jira tickets** for each sprint
4. **Set up analytics** for tracking metrics
5. **Begin Sprint 1** implementation

---

## Notes

- **expo-contacts** is stable and well-supported (v15.0.11 as of Feb 2026)
- **Contact syncing** is a standard feature in social apps (WhatsApp, Telegram, etc.)
- **Privacy-first approach** is critical for App Store approval
- **Gradual rollout** recommended (beta test with small group first)
- **Fallback to manual invite** if contact sync fails or user declines permission

---

## Questions for Product/Design

1. Should contact sync be **opt-in** or **opt-out**?
2. What's the **max friends per room** for trial vs lifetime users?
3. Should we support **multiple rooms** per user in the future?
4. What happens to **pending invites** after 30 days?
5. Should users be able to **block** or **mute** friends?

---

*Plan created: February 2026*
*Status: Ready for implementation*
