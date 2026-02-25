# Back Arrow Grey Circle – Root Cause Diagnosis

## The Problem

The back arrow appears with a grey circular background despite multiple attempts to remove it. The circle is applied by **native iOS**, not by our custom components.

---

## Root Cause: Native Stack + `headerLeft`

The grey circle comes from **screens that use `ActionBarAnimated`**, which uses the **native stack navigator** and custom `headerLeft`:

| Component             | How back button is rendered         | Grey circle? |
| --------------------- | ----------------------------------- | ------------ |
| **ActionBar**         | Custom `TouchableOpacity` in screen | **No**       |
| **ActionBarAnimated** | `headerLeft` in native stack header | **Yes**      |

### Screens using ActionBarAnimated (where the circle appears)

- **ChakraTemplate** (chakra detail: Root, Sacral, etc.)
- **Chakras101**
- **HeadToHeart**

### Why the circle appears

1. **Expo Router** uses the **native stack** (`@react-navigation/native-stack` / `react-native-screens`).
2. On iOS, the native stack uses **`UINavigationController`** and renders the header natively.
3. Custom `headerLeft` content is wrapped in a **native `UIBarButtonItem`**-style view.
4. On iOS, bar button items use a **default grey circular background/highlight**.
5. There is no supported React Navigation option to turn this off:
   - `headerLeftContainerStyle` was removed as unsupported
   - `headerStyle` and `headerTransparent` do not change the per-button styling

### References

- [react-native-screens #1477](https://github.com/software-mansion/react-native-screens/issues/1477) – Header/button background turning grey when using custom `headerLeft`/`headerRight`
- React Navigation docs – `headerLeft` replaces the back button but is still hosted in the native header

---

## The Blocker

The grey circle is applied by **native iOS** to elements rendered in the native header. Our JavaScript styles (`backgroundColor: 'transparent'`, etc.) are applied to our component, but iOS wraps that component in its own native view with its own styling. We cannot override that from the app code via supported options.

---

## Fix: Stop using the native header for these screens

To remove the grey circle, avoid putting the back button in the native header.

**Approach:** For screens that use `ActionBarAnimated`, switch to `headerShown: false` and render the back button as part of the screen content (like `ActionBar`). That keeps full control over styling.

### Required changes

1. **ActionBarAnimated**
   - Set `headerShown: false` instead of `headerShown: true`
   - Render the back button as an absolutely positioned element in the screen content, not via `headerLeft`
   - Keep the rest of the animated header behavior (e.g. background fade) if needed

2. **Layout impact**
   - The back button is no longer in the native header but in the screen layout
   - Use `position: 'absolute'`, safe area insets, and `zIndex` so it behaves like the current header button
   - This is the same pattern used by `ActionBar` (which does not show a grey circle)

### Summary

| Current                            | Proposed                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `headerShown: true` + `headerLeft` | `headerShown: false` + custom back button in content |
| Back button inside native header   | Back button as screen-level component                |
| Grey circle from iOS               | No grey circle; we fully control styling             |

---

## Files to modify

1. **`components/ActionBarAnimated.tsx`**
   - Remove `headerLeft` from `Stack.Screen` options
   - Set `headerShown: false`
   - Render a custom back button (similar to `ActionBar`) in the screen content with `position: 'absolute'`
   - Ensure it still receives `scrollViewRef`, `onBackPress`, etc., so animations and behavior are preserved
