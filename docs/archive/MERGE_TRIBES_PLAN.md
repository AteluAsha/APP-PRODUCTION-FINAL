# Merge Tribes – Design Note

## Goal

Allow two people to merge their whole tribes (their room members + pending invites) into one shared tribe so everyone can chat and see each other in a single room.

## Current Model

- One global room today: `tribeRooms/global-trial-tribe/members`.
- Members are keyed by `userId` (when connected) or `pending-{timestamp}` (when pending).
- Direct invites live in `tribeInvites` (fromUserId, toUserId, roomId, status). Accepting adds the user to `roomId`’s members.

## Options for “Merge Tribes”

### 1. Same room (current)

- Everyone uses `global-trial-tribe`. No real “your tribe” vs “their tribe”; merging is already the default when everyone accepts invites to the same room.
- To support “merge” explicitly: add a “Merge with [Name]’s tribe” from profile or Tribe that creates a mutual invite and, when both accept, treat both sides as one room (already true if roomId is the same).

### 2. Multiple rooms, then merge

- Each user could have a personal room (e.g. `tribeRooms/{userId}`). “Merge tribes” = create a new shared room and:
  - Copy or link all members from A’s room and B’s room into the new room, or
  - Invite the other room’s members (each gets a tribe invite to the new room).
- UX: User A taps “Merge tribes” on User B’s profile → send a special “merge request” to B. When B accepts, backend creates a new room, adds both A and B (and optionally their current members) to it, and both apps switch to that room.

### 3. Keep one room, add “merge” as mutual connection

- No new collections. “Merge tribes” = both users mutually add each other to the same room (e.g. two tribe invites: A→B and B→A). When both accept, they’re in the same room with the same members. No data migration.

## Recommendation (short term)

- Stay with **one global room** and **option 3**: “Merge tribes” is “we both invite each other.” Product copy: “Create the Connection to merge your tribes – you’ll both see each other and your invited friends in Tribe chat.”
- When we add per-user or per-group rooms later, implement **option 2** (merge = new shared room + invite all members from both sides).

## Implementation sketch (option 2, future)

1. **Merge request**  
   New collection or field: `tribeMergeRequests`: `{ fromUserId, toUserId, status, createdAt }`. From profile or Tribe, “Merge tribes” creates a request.

2. **Accept merge**  
   When B accepts:
   - Create room `tribeRooms/merged-{id}` (or use one user’s room as the target).
   - For each member in A’s room and B’s room, add them to the new room (or send them an invite to the new room).
   - Set both A and B as “owners” or mark the room as merged.
   - Client: switch current room to the new room and show it in Tribe chat.

3. **Chat and members**  
   - Messages live in the new room. Members list = everyone who was in either tribe (or who accepted the merge invite).

No code changes in this repo until we decide to ship multi-room or explicit merge; the current “Create the Connection” flow already grows the single shared tribe.
