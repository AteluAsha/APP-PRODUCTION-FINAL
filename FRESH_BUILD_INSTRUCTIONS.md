# Fresh Clean Build – Manual Steps

The automated build was started in the background. If it completes successfully, the iOS simulator will open automatically with the app.

## If you need to run manually:

### 1. Clean (optional – already done)
```bash
rm -rf node_modules .expo ios/build android/build
npm cache clean --force
```

### 2. Install
```bash
npm install
```

### 3. Prebuild (optional – already done)
```bash
npx expo prebuild --clean
```

### 4. Run iOS
```bash
npx expo run:ios
```
(Uses simulator by default; omit `--device` to avoid device-selection prompt)

### 5. Start Metro with clear cache (if app needs reload)
```bash
npx expo start --clear
```

## Build status
- `npm install` – completed
- `expo prebuild --clean` – completed (CocoaPods installed)
- `expo run:ios` – running in background (check terminal 662433 or /tmp/expo-ios-build.log)

First-time iOS builds often take 15–25 minutes. The simulator should open when the build finishes.
