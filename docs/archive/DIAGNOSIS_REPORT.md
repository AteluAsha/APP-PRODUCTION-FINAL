# StorybookShell Rendering Diagnosis

## Issue

The StorybookShell component renders as a black void - no border, arrows, or content visible.

## Root Cause Analysis

### Issue 1: React Native Web Fixed Positioning ⚠️ **PRIMARY SUSPECT**

**Location**: `components/dev/StorybookShell.tsx:250-261`

```typescript
overlay: {
  position: 'fixed',  // ← May not work on React Native Web
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.95)',
  zIndex: 99999,
  ...(Platform.OS === 'web' && {
    display: 'flex',
  }),
}
```

**Problem**: React Native's `View` component with `position: 'fixed'` may not work reliably on web. The platform-specific spread might not be enough.

**Evidence**: Other modals in the codebase use React Native's `Modal` component, not fixed positioning.

---

### Issue 2: Missing Modal Wrapper

**Location**: `components/dev/StorybookShell.tsx:202-246`

The component returns a `View` directly instead of using React Native's `Modal` component. Compare with `GoodbyeModal.tsx` which wraps content in `<Modal>`.

**Problem**: Without `Modal`, the overlay might not render above all other content on web.

---

### Issue 3: Screen Initialization (Minor)

**Location**: `components/dev/StorybookShell.tsx:47-49`

```typescript
const [activeIndex, setActiveIndex] = useState(0)
const currentScreen = ALL_SCREENS[activeIndex]
```

**Status**: ✅ This is fine - `ALL_SCREENS` is initialized at module level, `activeIndex` starts at 0, so `currentScreen` will be defined.

---

### Issue 4: Conditional Rendering Check

**Location**: `components/dev/StorybookShell.tsx:197-200`

```typescript
if (!__DEV__ || !visible) {
  return null
}
```

**Status**: ✅ This is fine - proper early return pattern. If this were blocking, component wouldn't render at all (not even black void).

---

### Issue 5: Keyboard Effect Dependencies

**Location**: `components/dev/StorybookShell.tsx:53-75`

The `useEffect` for keyboard navigation has dependencies on `visible` and `activeIndex`. This is correct, but the dependency array might cause re-renders.

**Status**: ⚠️ **MINOR** - This wouldn't prevent initial render, but could cause issues if dependencies change unexpectedly.

---

## Recommended Solutions (In Order of Stability)

### Solution 1: Use React Native Modal Component ⭐ **RECOMMENDED**

Replace the fixed-position `View` with React Native's `Modal` component. This is the standard pattern used throughout the codebase.

**Pros**:

- Matches existing patterns (GoodbyeModal, WelcomeModal, etc.)
- Guaranteed to work on all platforms
- Handles z-index layering automatically
- Supports `visible` prop natively

**Cons**:

- Requires slightly different structure
- Animation type needs to be specified

---

### Solution 2: Use Platform-Specific Web Styling

If keeping `View`, ensure web-specific styles are applied correctly using `StyleSheet.flatten` or platform-specific style objects.

**Pros**:

- Keeps current structure
- Minimal changes

**Cons**:

- Still might have compatibility issues
- More complex styling logic

---

### Solution 3: Debug Render Output

Add console logs to verify component is actually rendering and receiving props correctly.

**Pros**:

- Helps confirm diagnosis
- Non-invasive

**Cons**:

- Doesn't fix the issue, just confirms it

---

## Next Steps

1. **Primary Fix**: Replace fixed-position `View` with `Modal` component
2. **Verify**: Check that `visible` prop is being passed correctly from `DevGalleryTrigger`
3. **Test**: Verify keyboard navigation works after fix
