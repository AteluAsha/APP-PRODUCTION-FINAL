# iOS build fix (xcodebuild exit code 65)

## What was fixed

The iOS build was failing with **Swift compile errors** in two Expo packages that use APIs removed or renamed in the current **expo-modules-core** (used by Expo 52):

1. **expo-application** – `Constant("key") { value }` was removed; the API is now `Constants { [ "key": value, ... ] }`.
2. **expo-notifications** – `appContext.jsLogger.warn(...)` was removed; the simulator warning was replaced with `print(...)`.

These edits were applied **in `node_modules`**:

- `node_modules/expo-application/ios/ApplicationModule.swift` – use `Constants { [ ... ] }` instead of four `Constant(...)` calls.
- `node_modules/expo-notifications/ios/EXNotifications/PushToken/PushTokenModule.swift` – use `print(...)` instead of `appContext.jsLogger.warn(...)`.

## After `npm install`

Those changes live only in `node_modules`, so a **fresh `npm install`** will overwrite them and the iOS build can fail again with the same Swift errors.

**Options:**

1. **Re-apply the edits** – Open the two files above and make the same changes (see diff-style summary below), then run `npx expo run:ios`.
2. **Use patch-package** – After re-applying the edits once, run `npx patch-package expo-application` and `npx patch-package expo-notifications`, commit the new files in `patches/`, and add `"postinstall": "patch-package"` to `package.json` so future installs apply the patches automatically.

## Quick reference (re-apply edits)

**expo-application/ios/ApplicationModule.swift**  
Replace the four `Constant("...") { ... }` blocks with:

```swift
Constants {
  [
    "applicationName": infoPlist?["CFBundleDisplayName"] as? String,
    "applicationId": infoPlist?["CFBundleIdentifier"] as? String,
    "nativeApplicationVersion": infoPlist?["CFBundleShortVersionString"] as? String,
    "nativeBuildVersion": infoPlist?["CFBundleVersion"] as? String
  ]
}
```

**expo-notifications/ios/EXNotifications/PushToken/PushTokenModule.swift**  
In the `#if targetEnvironment(simulator)` block, replace:

```swift
if let appContext = appContext {
  appContext.jsLogger.warn("expo-notifications: ...")
}
```

with:

```swift
print("expo-notifications: obtaining a push token may not work on iOS simulators ...")
```

## Other iOS build issues

- **Pods / header search path issues:** Run `bash scripts/fix-ios-build.sh` (cleans `ios/build`, `Pods`, `Podfile.lock` and runs `pod install`). Ensure Xcode is selected: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.
- **Still failing:** Try regenerating the native project: `npx expo prebuild --clean --platform ios`, then `npx expo run:ios`.
