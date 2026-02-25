# Fresh Clean Build – Manual Steps

Run the build **in the foreground** in a terminal you keep open. The iOS Simulator will open when the build finishes (or open it first via the script).

## Option A: Full cache clear + rebuild (recommended when things are stuck)

From the project root:

```bash
./CLEAR_ALL_CACHES_AND_REBUILD.sh
```

This clears caches, reinstalls Pods, opens the Simulator app, then runs `npx expo run:ios`. **Keep the terminal open** until the build completes; the app will launch in the simulator automatically.

## Option B: Manual steps

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

### 4. Run iOS (opens simulator when build completes)

```bash
# Optional: open Simulator first so you see it early
open -a Simulator

# Build and run (keeps terminal in foreground; simulator launches automatically)
npx expo run:ios
```

Uses the default simulator; omit `--device` to avoid the device-selection prompt. **Keep the terminal open**—Metro runs in this process.

### 5. Start Metro with clear cache (if app needs reload)

```bash
npx expo start --clear
```

## Notes

- First-time iOS builds often take 15–25 minutes.
- Run `expo run:ios` in the **foreground** so the simulator opens when the build finishes. Do not run it in the background.
- If the simulator doesn’t open, run `open -a Simulator` first, then run `npx expo run:ios` again.
