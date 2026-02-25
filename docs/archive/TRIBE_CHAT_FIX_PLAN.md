# Tribe Chat Fix Plan – Diagnosis & Implementation

## Problem Summary

Tribe Chat fails to load properly when tapping the tribe icon in the trial waiting room. It appears partially (sliding up from bottom, cut off) instead of full-screen. Multiple fixes (route-based screen, presentation options, path changes) have had no visible effect.

---

## Part 1: Why Updates May Not Be Rendering

### 1a. Metro / Build Cache Issues

**Symptoms:** Code changes don’t appear in the iOS simulator.

**Checks:**

1. **Metro cache** – `npx expo start --clear` (or `npm run dev:ios`)
2. **iOS build cache** – Remove build folder and rebuild:
   ```bash
   cd ios && rm -rf build Pods Podfile.lock && pod install && cd ..
   npx expo run:ios
   ```
3. **Simulator app cache** – Delete app from simulator (long-press icon → Remove App), then reinstall.
4. **Watch Metro** – Confirm “Bundled successfully” after saving files; if not, Metro may not be picking up changes.

### 1b. Fast Refresh Not Working

- Turn off Fast Refresh and use full reload: shake device → “Reload”.
- Or in Metro: press `r` in the terminal for a full reload.

### 1c. Wrong Entry Point / Bundle

- Confirm the simulator is loading from the correct Metro instance (e.g. port 8081).
- If multiple Metro processes exist, kill them:
  ```bash
  lsof -ti:8081 | xargs kill -9
  ```

---

## Part 2: Current Tribe Chat Flow

### 2a. What’s Implemented

| Location                          | Action                                | Target          |
| --------------------------------- | ------------------------------------- | --------------- |
| `WaitingScreen.tsx` (trial)       | `router.push("/(chakras)/TribeChat")` | TribeChat route |
| `FloatingNavButtons.tsx` (trial)  | `router.push("/(chakras)/TribeChat")` | TribeChat route |
| `PermanentMenuBar.tsx` (lifetime) | `router.push("/(chakras)/TribeChat")` | TribeChat route |

### 2b. What’s NOT in Use

- **TribeChatModal** – Uses `useTribeChatStore` and `Modal`; not rendered anywhere. `app/_layout.tsx` does not import or render it.
- **useTribeChatStore.open()** – Nothing calls it; all tribe entry points use `router.push`.

### 2c. Route Structure

- `app/(chakras)/TribeChat.tsx` → route in (chakras) Stack.
- `app/(chakras)/_layout.tsx` → `Stack.Screen name="TribeChat"`.
- Root Stack: `(chakras)`, `AudioPlayer`, `CommunityHalls`.

### 2d. Possible Route Resolution Issue

Expo Router with route groups: `app/(chakras)/TribeChat.tsx` may resolve to:

- `/TribeChat` (group not in path), or
- `/(chakras)/TribeChat` (group in path).

Using `router.push("/(chakras)/TribeChat")` is consistent with other routes, but if the real path is `/TribeChat`, the push could fail or behave oddly. Worth verifying with `router.pathname` or logging.

---

## Part 3: Why “Partial / Slide Up” Looks Like a Modal

The behavior (slides up from bottom, partially visible, doesn’t fill screen) matches:

1. **Modal presentation** – e.g. `fullScreenModal` not filling the screen.
2. **Bottom sheet** – e.g. `@gorhom/bottom-sheet` behavior.
3. **TribeChatModal** – If it were mounted and opened by a store, it would show as a Modal and could look like this. But it’s not mounted.
4. **Route rendering in wrong layout** – If TribeChat renders inside a parent that clips or constrains it (e.g. wrong flex, overflow).

---

## Part 4: Recommended Fix – Use TribeChatModal + Store

Because route-based TribeChat changes haven’t worked, switch back to the Modal approach and ensure it’s wired correctly.

### 4a. Add TribeChatModal to Root Layout

1. In `app/_layout.tsx`, import and render `TribeChatModal`:

   ```tsx
   import { TribeChatModal } from "@/components/tribe/TribeChatModal"
   // ... inside the return, e.g. near ProfileSheet:
   <ProfileSheet />
   <TribeChatModal />
   ```

### 4b. Wire Tribe Button to Store Instead of Router

1. In `WaitingScreen.tsx`, change tribe button:

   ```tsx
   // FROM:
   router.push("/(chakras)/TribeChat")

   // TO:
   useTribeChatStore.getState().open()
   ```

2. In `FloatingNavButtons.tsx`, change `openTribeChat`:

   ```tsx
   // FROM:
   router.push("/(chakras)/TribeChat")

   // TO:
   useTribeChatStore.getState().open()
   ```

3. In `PermanentMenuBar.tsx`, change tribe menu item:
   - Instead of `route: "/(chakras)/TribeChat"`, use `onPress: () => useTribeChatStore.getState().open()` (or equivalent handler that opens the modal).

### 4c. Harden TribeChatModal for iOS

- Use `presentationStyle="overFullScreen"` and `statusBarTranslucent`.
- Ensure the Modal content uses `flex: 1` and fills the screen.
- Test on iOS simulator.

---

## Part 5: Alternative – Fix Route-Based Flow

If you prefer to keep the route-based TribeChat:

### 5a. Add Debug Logging

In `WaitingScreen.tsx` tribe button:

```tsx
onPress={() => {
  console.log("[Tribe] Button tapped, pushing route")
  addHapticFeedback(HapticStrength.Light)
  router.push("/(chakras)/TribeChat")
}}
```

In `app/(chakras)/TribeChat.tsx`:

```tsx
useEffect(() => {
  console.log("[TribeChat] Screen mounted - TribeChat ROUTE is rendering")
  return () => console.log("[TribeChat] Screen unmounted")
}, [])
```

- If “Button tapped” appears but “Screen mounted” does not, navigation/route resolution is wrong.
- If “Screen mounted” appears but UI is wrong, the issue is layout inside TribeChat.

### 5b. Try Different Paths

- `router.push("/TribeChat")` (no group)
- `router.push("TribeChat")` (relative)
- Compare with `router.pathname` or route params after push.

### 5c. Move TribeChat to Root Stack

Create `app/TribeChat.tsx` (outside `(chakras)`) and add it to the root Stack:

```tsx
<Stack.Screen name="TribeChat" options={{ headerShown: false }} />
```

Then use `router.push("/TribeChat")` from WaitingScreen. This isolates TribeChat from the (chakras) layout and nested Stack.

---

## Part 6: Verification Checklist

- [ ] Metro cache cleared (`--clear`) and app fully reloaded
- [ ] iOS build cache cleared (clean build)
- [ ] Simulator app deleted and reinstalled
- [ ] Debug logs confirm tribe button tap and (if route-based) TribeChat mount
- [ ] TribeChatModal is in `_layout` and tribe entry points call `useTribeChatStore.getState().open()` (if using modal path)
- [ ] TribeChat screen or modal fills the screen on iOS

---

## Next Steps

1. Run a full clean rebuild (Part 1) and retest.
2. Add debug logging (Part 5a) to see whether route navigation is firing.
3. If route navigation still fails, switch to TribeChatModal (Part 4).
4. If TribeChatModal is used, verify layout and presentation for iOS (Part 4c).

---

## IMPLEMENTED (Latest)

Switched from route-based TribeChat to TribeChatModal:

1. **TribeChatModal added to `app/_layout.tsx`** – Renders globally alongside ProfileSheet.
2. **Tribe entry points now use `useTribeChatStore.getState().open()`**:
   - `WaitingScreen.tsx` (trial waiting room)
   - `FloatingNavButtons.tsx` (trial floating buttons)
   - `PermanentMenuBar.tsx` (lifetime tribe menu item)
3. **TribeChatModal made full-screen**:
   - Overlay: `flex: 1`, black background (no centering)
   - modalBox: `flex: 1`, `width: "100%"` (no maxWidth/maxHeight)
   - SafeAreaView for insets
   - `animationType="slide"` for clearer modal behavior

**Clean rebuild to pick up changes:**

```bash
# Kill Metro
lsof -ti:8081 | xargs kill -9

# Clear Metro cache + iOS
cd ios && rm -rf build && cd ..
npx expo start --clear --ios
```

Or full native rebuild:

```bash
cd ios && rm -rf build Pods Podfile.lock && pod install && cd ..
npx expo run:ios
```
