# Gentle Restoration Plan – Days 1–7 Hero Pages

**Problem:** Layout broken (large black gap, missing buttons). Previous fixes made things worse.

**Approach:** Restore from known-good commit (ea10bb5) using `git checkout`, then add back only essential features with minimal surgical changes.

---

## Step 1: Restore Exact ea10bb5 Code

Run these commands to get the exact working code:

```bash
cd /Users/erindinsmore/Desktop/7chakras7days_app

# Restore all 6 hero components from ea10bb5 (no modifications)
git checkout ea10bb5 -- \
  components/ParallaxScrollView.tsx \
  components/chakras/HeaderSection.tsx \
  components/chakras/HeaderBackground.tsx \
  components/chakras/AudioRow.tsx \
  components/chakras/PillSection.tsx
```

**Do NOT restore ChakraTemplate** – it has many feature additions (DropInButton, PillBottomSheet, etc.). We only restore the shared layout components.

---

## Step 2: Minimal Additions for ChakraTemplate Compatibility

After restore, ChakraTemplate needs these small adjustments:

### 2a. HeaderSection – Add rightContent (for DropInButton)

ea10bb5 HeaderSection has no `rightContent`. Add it after the text View:

```tsx
{
  rightContent != null ? (
    <View
      style={{ position: "absolute", right: 24, bottom: 12 }}
      pointerEvents="box-none"
    >
      {rightContent}
    </View>
  ) : null
}
```

And add `rightContent?: React.ReactNode` to the props type.

### 2b. ChakraTemplate – Pass rightContent only when needed

ChakraTemplate already passes `rightContent={hasLifetimeAccess ? <DropInButton ... /> : undefined}`. No change needed if HeaderSection accepts it.

### 2c. AudioRow – Add chakraColor and router.replace (optional)

ea10bb5 uses `router.push`. ChakraTemplate expects `router.replace` and `chakraColor`. Add these to the restored AudioRow props and onPress handler. Minimal change.

---

## Step 3: ChakraTemplate – Restore Layout Wrappers Only

If ChakraTemplate has inline styles that differ from ea10bb5, restore the wrappers:

- `View className="pb-20"` (not `style={{ paddingBottom: 80 }}`)
- `View className="bg-black"` (not `style={{ backgroundColor: "#000000" }}`)

Keep all feature logic (embodimentAudio, PillBottomSheet, DropInButton, etc.).

---

## Step 4: Verify Babel

Ensure babel.config.js matches ea10bb5 (already does):

```js
presets: [
  ["babel-preset-expo", { jsxImportSource: "nativewind" }],
  "nativewind/babel",
],
plugins: ["react-native-reanimated/plugin"],
```

---

## Step 5: Clear Caches and Rebuild

```bash
rm -rf node_modules/.cache .expo
watchman watch-del-all
npx expo start --clear --ios
```

---

## Files to Restore (Unchanged from ea10bb5)

| File                   | Action                                                         |
| ---------------------- | -------------------------------------------------------------- |
| ParallaxScrollView.tsx | `git checkout ea10bb5 --`                                      |
| HeaderSection.tsx      | `git checkout ea10bb5 --` then add rightContent prop           |
| HeaderBackground.tsx   | `git checkout ea10bb5 --`                                      |
| AudioRow.tsx           | `git checkout ea10bb5 --` then add chakraColor, router.replace |
| PillSection.tsx        | `git checkout ea10bb5 --`                                      |

---

## What We Are NOT Changing

- ChakraTemplate feature logic (embodimentAudio, PillBottomSheet, navigateBack, etc.)
- Babel config
- Other screens (HeadToHeart, ChakraHub, etc.)
- Content constants

---

## Rollback

If this makes things worse:

```bash
git checkout HEAD -- components/ParallaxScrollView.tsx components/chakras/HeaderSection.tsx components/chakras/HeaderBackground.tsx components/chakras/AudioRow.tsx components/chakras/PillSection.tsx
```
