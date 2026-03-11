# Android: Metro and real-time updates (emulator + real device)

To see JS/TS changes on Android, the app must load the bundle from Metro and you must reload after edits.

## Real Android device not loading

On a **physical device** (not emulator), the app must reach Metro on your computer. The device cannot use `10.0.2.2` (that is for the emulator only). Use your computer's **LAN IP** (e.g. `192.168.1.x`) so the phone and Mac are on the same Wi‑Fi and the app can load the bundle.

**One command (recommended):**
```bash
npm run android:device
```
This detects your LAN IP, sets `REACT_NATIVE_PACKAGER_HOSTNAME`, and runs `expo run:android` (build + install + Metro). Keep the terminal open so Metro stays running.

**Manual:** If the script cannot detect your IP, set it yourself. On Mac: System Settings → Network → Wi‑Fi → Details to see your IP. Then:
```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.XXX env -u CI npx expo run:android
```
Replace `192.168.1.XXX` with your computer's IP. Device and computer must be on the same Wi‑Fi.

**Check device is seen:** `adb devices` should list your phone. If not, enable USB debugging (or wireless debugging on Android 11+) and connect.

**If build fails with "SDK location not found":** Set the Android SDK path so Gradle can build. Either:
- `export ANDROID_HOME=$HOME/Library/Android/sdk` (macOS default if you use Android Studio), then run `npm run android:device` again; or
- Create `android/local.properties` with one line: `sdk.dir=/path/to/your/Android/sdk` (use your actual SDK path).

---

## Android emulator

## Android app never loads ("Failed to open app")

If the dev client shows "Failed to open app" or "There was a problem loading the project" when you tap **http://10.0.2.2:8081**, the cause is usually **not** the URL but the **manifest**: Metro runs `git` to build dev metadata; on macOS, `git` (Xcode Command Line Tools) exits with code 69 until the Xcode license is accepted, so Metro returns that error as the manifest and the dev client never loads.

- **Path A (recommended):** Accept the Xcode license once: in Mac Terminal run `sudo xcodebuild -license`, type `agree`. Then confirm `git --help` exits with 0. Restart Metro (`npm run start:android`) and connect from the emulator again.
- **Path B (workaround):** If you cannot accept the Xcode license, start Metro with a fake `git` so it does not fail: `npm run start:android:no-git` (see [scripts/run-metro-android-no-git.sh](scripts/run-metro-android-no-git.sh)).
- **Verify where it fails:** Run `npm run verify:android` (or `bash scripts/verify-android-dev.sh`). The script checks git, Metro, manifest response, adb, and launches the app; it prints which step passed or failed.

## Android emulator: use the right URL (important)

The Android emulator can only reach your Mac’s Metro server at **`10.0.2.2:8081`** (the emulator’s alias for the host). It often **cannot** reach your LAN IP (e.g. `192.168.1.29:8081`).

- In the **Development Build** home screen, under **Development servers**, use the entry that shows **`http://10.0.2.2:8081`** (green dot). Do **not** tap a “Recently opened” entry that uses `192.168.x.x` — that will fail with “Error loading app”.
- Or tap **Enter URL manually** and type: **`http://10.0.2.2:8081`**, then Connect.
- To avoid tapping the wrong URL by mistake: under **Recently opened**, tap **Reset** so the old `192.168.1.29` URL is cleared.

## Run Android with Metro (recommended, two terminals)

Use these so Metro advertises `10.0.2.2` and the app opens with the correct URL:

**Terminal 1 – start Metro for Android emulator (keep running):**
```bash
npm run start:android
```
(or: `REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2 env -u CI npx expo start --clear`)

**Terminal 2 – build, install, and open the app:**
```bash
npm run android:run
```
(or: `REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2 npx expo run:android --no-bundler`)

The app will open with `http://10.0.2.2:8081` and should load. Keep Terminal 1 open so Metro stays running.

## Single-command run (alternative)

From the project root:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2 env -u CI npx expo run:android
```

- This builds, installs, starts Metro, and opens the app with the correct URL in one process. **Keep this terminal open** so Metro stays running.
- If the process exits right after opening the app, Metro stops and you’ll see “Failed to open app”. Use the two-terminal flow above instead.

## After code changes

Data files (e.g. `chakra_quizzes.json`) are bundled with the app at load time; a reload fetches the latest bundle and shows updated quiz content.

1. Save your files.
2. Reload the app so it fetches the latest bundle:
   - In the **Metro terminal**: press **`r`** for a full reload, or
   - In the **Android emulator**: **double-tap R** (or Device → Reload).

Do not assume a reload happened; trigger it explicitly.

## No change after reload?

Follow this checklist so the new bundle actually loads:

1. **Single process:** Run Android and Metro together so the app stays connected:
   ```bash
   env -u CI npx expo run:android
   ```
   Keep this terminal open; do not start Metro in a separate terminal unless you have a reason.

2. **Explicit reload after code changes:** Do not assume a reload happened.
   - In the **Metro** terminal (the one running `expo run:android`), press **`r`** for a full reload, or
   - In the **Android emulator:** **double-tap R** (or Device → Reload).

3. **If updates still do not appear:** Stop Metro (Ctrl+C), clear caches, then use the Android URL-safe flow:
   ```bash
   rm -rf node_modules/.cache .expo
   npm run start:android
   ```
   In a second terminal: `npm run android:run`. When the app is up, trigger a reload (press `r` in the Metro terminal or double-tap R in the emulator). In the dev client, ensure you are connected to **`http://10.0.2.2:8081`**, not a 192.168.x.x URL.

No native rebuild is required for JS-only changes; a reload with the app connected to Metro is enough.

## "Failed to open app" / "Error loading app"

This usually means the app could not reach Metro (e.g. stack trace mentions `downloadManifest` / `DevLauncherManifestParser`).

**Common cause:** The app is trying to connect to **`192.168.x.x:8081`** (your Mac’s LAN IP). The Android emulator often cannot reach that address. It must use **`10.0.2.2:8081`** instead.

**Fix:**

1. **In the Development Build app on the emulator:**
   - Tap **Enter URL manually** and enter exactly: **`http://10.0.2.2:8081`**, then Connect.
   - Or tap the **Development servers** entry that shows **`http://10.0.2.2:8081`** (green dot). Do not tap **Recently opened** if it shows `192.168.1.29` or any other IP.
   - Optionally tap **Reset** under Recently opened so the bad URL is cleared.

2. **On your Mac:** Ensure Metro is running with the emulator hostname so it advertises the right URL:
   ```bash
   npm run start:android
   ```
   Keep that terminal open. Then launch the app (or reconnect from the dev client using `10.0.2.2:8081` as above).

**Git exit code 69 and "Failed to open app":** If you see "git --help exited with non-zero code: 69" in the Metro terminal, Metro is returning that error as the manifest, so the dev client fails with "Failed to open app." On macOS this is usually because **the Xcode license has not been accepted.** In the Mac Terminal run: `sudo xcodebuild -license`, type `agree`, then restart Metro and try again. If Git is installed but Cursor says it’s not found, set `git.path` in Cursor/VS Code settings to the full path to your `git` binary (e.g. `/usr/bin/git` or from Xcode Command Line Tools).

**Optional – port forwarding:** If you prefer the emulator to use `localhost:8081`, run once before opening the app (with Metro already running on the host):
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```
   Then in the dev client you can try **Enter URL manually** → `http://localhost:8081`. This only works if `adb` is on your PATH (e.g. Android SDK `platform-tools`).
