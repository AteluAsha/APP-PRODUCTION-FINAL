# Waiting Room Menu Bar – Why Changes Didn’t Show & How to See Them

## What’s going on

The **code is correct**: all four icons (Preview, Chakras 101, tribe, Anua) are in a single row in `components/chakras/WaitingScreen.tsx`. The trial waiting room menu bar is one `View` with `flexDirection: "row"` and all four items inside it.

The issue is **not** the code. The issue is that the **iOS app is still running an old JavaScript bundle**, so you keep seeing the previous UI.

Expo/React Native work like this:

- **Native app** (from `expo run:ios`) loads **JavaScript** from Metro (or from a bundle baked into the app).
- If Metro isn’t running, or the app is using a **cached bundle**, you won’t see the latest changes.

So: **“Changes being blocked”** = app not loading the new bundle. It’s a **reload/cache** issue, not a button/layout bug.

## How to see the updated menu bar (single row of 4 icons)

1. **Clear caches (already done once):**

   ```bash
   rm -rf node_modules/.cache .expo
   ```

2. **Start Metro with a clean cache:**

   ```bash
   npx expo start --clear
   ```

   Leave this terminal running.

3. **In the iOS Simulator:**
   - If the app is already open: press **Cmd + R** to reload and fetch the new bundle from Metro.
   - Or fully quit the app (Cmd + Q or swipe up) and open it again from the simulator so it loads from Metro.

4. **Go to the Trial Waiting Room** (date selected, before course start). You should see **one row** at the bottom: Preview | Chakras 101 | tribe | Anua.

## If it still doesn’t update

- Confirm Metro is running and the simulator shows “Connected” (or no connection error).
- Try **closing the app in the simulator** and opening it again after Metro is running with `--clear`.
- As a last resort, run a fresh native build so the app definitely uses Metro:
  ```bash
  npx expo run:ios
  ```
  Then use **Cmd + R** in the simulator after the app launches.

## Summary

- **Failure reason:** Old JS bundle; app not loading the updated `WaitingScreen` code.
- **Fix:** Clear caches, start Metro with `npx expo start --clear`, then **reload the app** in the simulator (Cmd + R) or reopen the app.
