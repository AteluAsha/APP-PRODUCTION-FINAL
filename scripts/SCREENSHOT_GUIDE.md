# Dev Gallery Screenshot Guide

Since the Dev Gallery uses React Native navigation (which doesn't work well with browser automation), here's a simple manual approach:

## Quick Screenshot Method

### Using Browser Developer Tools

1. **Start the web server:**

   ```bash
   npx expo start --web
   ```

2. **Open Dev Gallery:**
   - Click the small green button (top-right)
   - Or press `Ctrl/Cmd + Shift + D`

3. **Take Screenshots:**
   - **Chrome/Edge:** Press `F12` → Click the device toolbar icon → Click "Capture screenshot" (camera icon)
   - **Firefox:** Press `F12` → Click "Take a screenshot" (camera icon)
   - **Safari:** Press `Cmd+Option+I` → Settings → Enable "Screenshots" → Click screenshot icon

### Using Browser Extension (Recommended)

Install a screenshot extension like:

- **Full Page Screen Capture** (Chrome/Edge)
- **Awesome Screenshot** (Chrome/Firefox/Edge)
- **Nimbus Screenshot** (All browsers)

### Manual Process

1. Navigate through Dev Gallery screens
2. For each screen, take a screenshot
3. Save to `screenshots/gallery/` folder
4. Name files descriptively (e.g., `Trial1-Root-Chakra.jpg`)

## Screenshot List

### Trial 1: Chakra Days

- Trial1-Root-Chakra.jpg
- Trial1-Sacral-Chakra.jpg
- Trial1-Solar-Plexus-Chakra.jpg
- Trial1-Heart-Chakra.jpg
- Trial1-Throat-Chakra.jpg
- Trial1-Third-Eye-Chakra.jpg
- Trial1-Crown-Chakra.jpg

### Trial 2: Chakra Days

- Trial2-Root-Chakra.jpg
- Trial2-Sacral-Chakra.jpg
- Trial2-Solar-Plexus-Chakra.jpg
- Trial2-Heart-Chakra.jpg
- Trial2-Throat-Chakra.jpg
- Trial2-Third-Eye-Chakra.jpg
- Trial2-Crown-Chakra.jpg

### Thresholds & Gates

- Welcome-Modal.jpg
- Waiting-Room.jpg
- Goodbye-Modal.jpg
- Commitment-Gate-Paywall.jpg

### Post-Paywall

- ChakraHub-Home.jpg
- Community-Halls.jpg

## Tips

- Use consistent viewport size (e.g., iPhone X: 375x812)
- Wait for screens to fully load before capturing
- Take screenshots in the same lighting/theme mode
- Organize files in the `screenshots/gallery/` folder
