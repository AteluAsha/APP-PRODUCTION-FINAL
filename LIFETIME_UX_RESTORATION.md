# Lifetime Access UX Restoration

## Design Reference (Production-Approved)

- **ANUA_UX_AND_FLOW_PLAN.md**: Anua button opens Sanctuary (not chat directly) except on Waiting Room. Sanctuary "Talk to Anua" calls `onOpenAnuaChat`; parent dismisses notes, closes sanctuary, 200ms delay, then opens chat.
- **ANUA_CHAT_FIXES_COMPLETE.md**: Input positioning, voice toggle, daily transmissions, share modal, clean waiting screen.

## Restored Components (Explicit Style – No Design Changes)

### Anua

- **AnuaChatModal.tsx**
  - SafeAreaView: `flex: 1`, `backgroundColor: "#000000"`
  - KeyboardAvoidingView: `flex: 1`
  - Header: row (flexDirection, alignItems, justifyContent, padding, borderBottom), avatar (size, marginRight), title/subtitle (color, marginTop), close button (padding)
  - Voice/Text toggle: container (padding, borderBottom), row (flexDirection, justifyContent), labels (color, marginLeft)
- **FloatingNavButtons.tsx**
  - "sanctuary" label: `color: "#ffffff"`, `marginBottom: 4`
  - Anua button opens Sanctuary (`setIsSanctuaryModalVisible(true)`). `onOpenAnuaChat`: dismiss notes → close sanctuary → 200ms → `useAnuaChatStore.getState().open({ isWaitingRoom })`
- **PermanentMenuBar.tsx**
  - Same `onOpenAnuaChat`: dismiss notes → close sanctuary → 200ms → open Anua chat. `isLimitedMode={false}` for APP_2.

### Social Sanctuary Modal

- **SocialSanctuaryModal.tsx**
  - Root: SafeAreaView, KeyboardAvoidingView with explicit `style`
  - Header: padding, borderBottom, title, close button, day/chakra subtitle (all with explicit colors/margins)
  - Options: ScrollView with contentContainerStyle; gap containers; Talk to Anua, Share with Community, Social Sanctuary buttons (flexDirection, alignItems, gap, opacity for limited mode, text color/margins)
  - Community Highlights: marginTop, row, AppText (marginLeft, color)
  - Reflection cards: flexRow, justifyContent, marginBottom, text colors
  - Back to Options bar and Chakra day selector: padding, borderBottom, flexDirection, text colors
  - Community view header (Post to this chakra day): same pattern
  - Loading: flex, alignItems, justifyContent, paddingVertical, ActivityIndicator, text (color, marginTop)
  - Error: paddingVertical, error text (color, textAlign), Retry button (marginTop, backgroundColor, borderRadius, padding, alignSelf)
  - Empty: paddingVertical, alignItems, icon, text (color, marginTop, textAlign)
  - Reflection list: gap, card (backgroundColor, borderRadius, padding, border), row (flexDirection, justifyContent), text (color, lineHeight)
  - Post form: borderTop, backgroundColor, padding, anonymous row (flexDirection, marginBottom), input row (flexDirection, gap), TextInput (flex, backgroundColor, borderRadius, padding, color, border, minHeight), Send button (backgroundColor, borderRadius, padding, opacity when disabled), character count (color, marginTop, textAlign)

### Notes

- **NotesAlongTheWay.tsx**
  - Header title and subtitle: explicit color, marginBottom; empty state and day/note cards: color, marginTop, textAlign, paddingHorizontal, marginBottom, lineHeight; "Send thought to Anua" link: color
- **JourneyNotesView.tsx**
  - Header, loading message, empty state, day headers, note date/content, "Send thought to Anua", "Open full diary": all use explicit `style` (color, marginTop, marginBottom, textAlign)

### Community Halls & Tribe Chat

- **CommunityHallsScreen.tsx**: No `className` usage; layout already via StyleSheet or inline style.
- **TribeChat.tsx** / **TribeChatContent.tsx**: No `className` usage; container uses StyleSheet.
- Access: Trial – FloatingNavButtons (Notes, Tribe Chat, Anua/Sanctuary). Lifetime – PermanentMenuBar (Notes, Anua/Sanctuary, Tribe, etc.). Tribe Chat and Community Halls routes are reachable from Sanctuary or menu; no display pathway blocks introduced.

## Pathways Verified

- **Trial**: FloatingNavButtons visible; Anua → Sanctuary → "Talk to Anua" → onOpenAnuaChat (notes dismiss, sanctuary close, 200ms, chat open). Notes and Tribe Chat buttons work.
- **Lifetime**: PermanentMenuBar visible; Anua menu item → Sanctuary; same onOpenAnuaChat flow. Community Halls via Sanctuary "Social Sanctuary" or menu; Tribe Chat via menu.
- **Waiting Room**: Anua can open chat directly (WaitingScreen has its own Anua entry); limited mode shows previews for Share/Community.

## Coding / Display Issues Addressed

- Replaced all `className`-only layout and text color in Anua, Sanctuary, Notes, and JourneyNotesView with explicit `style` so behavior matches production when Tailwind/className do not apply.
- Removed duplicate `contentContainerStyle` in SocialSanctuaryModal community ScrollView (merged into one object).
- No changes to flow logic: onOpenAnuaChat, hasLifetimeAccess gating, or route structure.

When aligning with "3 days ago" or production-approved designs, use this doc and the referenced ANUA_* plan files; restore only via explicit `style`, do not change intended UX or copy.
