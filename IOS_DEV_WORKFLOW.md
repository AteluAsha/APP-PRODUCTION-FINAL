# iOS development – real-time updates

To see code changes on the iOS simulator or device without rebuilding:

## Full reset and sync (use when things feel out of sync)

1. **Stop any running Metro**  
   In any terminal where Expo/Metro is running, press **Ctrl+C**.

2. **Fix “too many open files” (if you see EMFILE errors)**  
   - Install Watchman (recommended):  
     `brew install watchman`  
   - Or raise the file limit for this shell:  
     `ulimit -n 10240`

3. **Start Metro with a clean cache**  
   From the project root:  
   `npm run start:clear`

4. **Open the app**  
   In the Expo terminal press **`i`** for iOS simulator, or open the app on your device and reload (Cmd+D → Reload).

---

## 1. Start Metro with a clean cache

From the project root:

```bash
npm run start:clear
```

Or:

```bash
npm run dev:ios
```

(`dev:ios` runs `expo start --clear --ios` so the cache is cleared and the iOS app can be opened from the same terminal.)

## 2. Open the app

- **Simulator:** In the Expo terminal, press **`i`** to open the iOS simulator and load the app, or open the already-installed app from the simulator.
- **Device:** Shake the device and choose “Reload” if the app is already open, or scan the QR code from the Expo terminal to open the app.

## 3. Confirm the app is using this Metro server

- The dev app (built with `expo run:ios`) loads the JS bundle from Metro.
- If you see an error like “Could not connect to development server,” Metro is not running or the app is pointing at the wrong host. Start Metro first with `npm run start:clear`, then open the app again.
- After saving a file, you should get **Fast Refresh** (component updates without full reload). If not, in the simulator press **Cmd + D** (or Device → Shake) and tap **Reload**.

## 4. When changes still don’t show

1. Stop Metro (Ctrl+C).
2. Run `npm run start:clear` again.
3. In the simulator: **Cmd + D** → **Reload** (or close the app and press **`i`** in the Expo terminal to reopen).

Rebuilding the native app (`npm run ios` / `expo run:ios`) is only needed when you change native code, dependencies, or `app.config.js`; for JS/TS and most UI changes, Metro + reload is enough.
