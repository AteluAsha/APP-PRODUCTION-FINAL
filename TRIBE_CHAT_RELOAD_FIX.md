# Tribe Chat – Why Updates Weren’t Showing & How to Fix

## Root Cause

1. **Two separate implementations** – Tribe Chat lived in both:
   - `components/tribe/TribeChatModal.tsx` (modal, had our updates)
   - `app/(chakras)/TribeChat.tsx` (route, old implementation)
   
   Depending on how it opened (modal vs route), you could see different UIs. The route still had the old design.

2. **CI mode disables hot reload** – When Metro runs with `CI=true` (common in automated environments), it shows:
   ```
   Metro is running in CI mode, reloads are disabled.
   ```
   Hot reload and Fast Refresh are disabled in that case.

## What Was Changed

1. **Single source of truth** – `components/tribe/TribeChatContent.tsx` is now the shared UI.
   - `TribeChatModal` – wraps content in a modal.
   - `app/(chakras)/TribeChat.tsx` – renders the same content as a full-screen route.

2. **All tribe entry points use the route** – Tribe buttons now call `router.push("/(chakras)/TribeChat")` instead of opening the modal. You always hit the route, which uses `TribeChatContent`.

3. **One place to edit** – All Tribe Chat changes go in `TribeChatContent.tsx`. Both the route and the modal use it.

## How to Run So Updates Show

1. **Use the npm script (recommended)** – It unsets CI:
   ```bash
   npm run start
   # or
   npm run dev:ios
   ```

2. **Avoid plain `npx expo start`** – That can inherit `CI=true` and disable reloads.

3. **For a clean slate** – Clear Metro and start again:
   ```bash
   npm run start:clear
   # Then press `i` for iOS simulator
   ```

4. **After code changes** – Press `r` in the Metro terminal for a full reload, or shake the device and choose “Reload”.
