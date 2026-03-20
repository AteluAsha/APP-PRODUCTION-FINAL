# iOS Simulator: Build and Run

## Hermes script phase fix (local builds)

The React Native Hermes "[CP-User] Replace Hermes for the right configuration" script phase can **hang** in some environments (e.g. when Xcode runs the phase and `with-environment.sh` sources nvm/find-node). To avoid this:

- **Podfile** includes a `post_install` hook that sets the Hermes replace script to `exit 0` for all builds. For Debug we do not need to replace the Hermes engine; the prebuilt variant is correct.
- **Pods project**: After `pod install`, the Hermes script phase in `Pods/Pods.xcodeproj` is patched to `exit 0`.

If a local `xcodebuild` or `npx expo run:ios` still hangs at the Hermes step, try:

1. Building from **Xcode GUI** (open `ios/SoulSchool.xcworkspace`, select the SoulSchool scheme, build for a simulator). Sometimes the script phase behaves differently in the IDE.
2. Using **EAS Build** for the simulator and installing the downloaded `.app` on the simulator (see below).

## Getting the app onto the simulator

### Option A: EAS simulator build

1. Run: `npx eas build --platform ios --profile simulator --non-interactive`
2. When the build completes, download the build artifact (`.app` or `.tar.gz` with the app).
3. Install on the booted simulator:
   ```bash
   xcrun simctl install <DEVICE_UDID> /path/to/SoulSchool.app
   ```
   Device UDID: `xcrun simctl list devices available` (use the `id` of the booted simulator).
4. Start Metro so the app can load the bundle:
   ```bash
   npm run start:dev-client:ios
   ```
5. On the simulator, open the "Soul School (Expo Development Build)" app. In the dev launcher, choose **http://127.0.0.1:8081** so it loads from Metro.

### Option B: Local build (when it completes)

1. Start Metro: `npm run start:dev-client:ios`
2. Build and run: `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 env -u CI npx expo run:ios`
3. If the build hangs at the Hermes step, use EAS (Option A) or build from Xcode GUI.

## After the app is installed (critical)

The dev client **does not** include the JS bundle. It loads it from Metro.

1. **Start Metro first:**  
   `npm run start:dev-client:ios`  
   Leave this terminal running.

2. **Open the Soul School app** on the simulator.

3. **In the dev launcher screen**, tap **http://127.0.0.1:8081** (or enter it).  
   If you don’t connect to Metro, the app will stay on the native splash (small logo) and never load.

4. Once connected, the app should load and show the splash then welcome flow.
