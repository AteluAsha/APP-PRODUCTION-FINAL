# Tribe Chat – iOS Troubleshooting

If Tribe Chat does not open or load on the iOS simulator, try these in order.

## 1. Code changes (already applied)

- **Modal presentation:** `presentationStyle="overFullScreen"` for transparent modals on iOS  
- **Modal mount:** Modal always mounted; only `visible` is toggled (avoids iOS mount/unmount issues)  
- **Firestore:** Try/catch around Firestore init in `useTribeChat`  
- **Status bar:** `statusBarTranslucent` for Android compatibility  

## 2. Clear caches and restart

```bash
# Clear Metro bundler cache
npx expo start --clear

# Or full reset:
rm -rf node_modules/.cache
npx expo start --clear --ios
```

## 3. iOS build clean

```bash
cd ios
rm -rf build
pod install
cd ..
npx expo run:ios
```

## 4. Full clean rebuild

```bash
# Clear Metro cache
rm -rf node_modules/.cache

# Clear Expo cache
npx expo start --clear

# Rebuild iOS (from project root)
npx expo run:ios --no-bundler
```

In another terminal:
```bash
npx expo start --clear
```

## 5. Verify Profile sheet (same Modal pattern)

If Tribe Chat still fails, test the Profile sheet (waffle icon on ChakraHub/ChakraHome):

- Profile works but Tribe Chat doesn’t → issue is likely in TribeChatModal / useTribeChat  
- Both fail → likely Modal or layout configuration  

## 6. Dev debug logs

In `components/chakras/WaitingScreen.tsx`, add:

```ts
onPress={() => {
  if (__DEV__) console.log('[Tribe] Opening tribe chat')
  addHapticFeedback(HapticStrength.Light)
  useTribeChatStore.getState().open()
}}
```

Check Metro logs when tapping the tribe button to confirm the handler runs.

## 7. Firebase config

If Tribe Chat opens but shows “Firebase not configured”:

- Ensure `.env` has Firebase config  
- Ensure `app.config.js` maps env vars into `extra.firebase`  

## 8. Firestore rules

If Tribe Chat opens but shows “Failed to load”:

- Confirm `firestore.rules` allows read for `tribes/{tribeId}/messages`  
- Deploy rules: `firebase deploy --only firestore:rules`  
