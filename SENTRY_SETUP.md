# Sentry Error Tracking Setup

## Quick Start

Sentry error tracking is now integrated into the app. It's **optional** and won't break anything if not configured.

### Setup Steps

1. **Create Sentry Account** (if you don't have one):
   - Go to https://sentry.io
   - Sign up for free account
   - Create a new project for "React Native"

2. **Install Sentry Package**:
   ```bash
   npx expo install @sentry/react-native
   ```

3. **Get Your DSN**:
   - In Sentry dashboard, go to Settings > Projects > Your Project
   - Copy the DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

4. **Add to .env file**:
   ```
   SENTRY_DSN=https://your-dsn-here@xxx.ingest.sentry.io/xxx
   ```

5. **Done!** Sentry will automatically:
   - Track crashes
   - Capture errors
   - Provide stack traces
   - Show user context

### Testing

To test Sentry in development:
1. Add to `.env`: `SENTRY_ENABLE_IN_DEV=true`
2. Update `app.config.js` to set `enableInDev: true` in sentry config
3. Restart the app

### Features

- ✅ **Automatic Crash Reporting**: All unhandled errors are captured
- ✅ **Manual Error Tracking**: Use `captureException()` for custom errors
- ✅ **User Context**: Automatically tracks user info
- ✅ **Performance Monitoring**: Optional (10% sample rate by default)
- ✅ **Production Only**: Disabled in dev by default (won't spam Sentry)

### Usage in Code

```typescript
import { captureException, captureMessage } from '@/src/services/sentry'

// Capture an error
try {
  // some code
} catch (error) {
  captureException(error, { context: 'additional info' })
}

// Capture a message
captureMessage('User completed chakra journey', 'info')
```

### Cost

- **Free Tier**: 5,000 events/month (plenty for most apps)
- **Paid**: Starts at $26/month for more events

---

**Note**: Sentry is completely optional. The app works fine without it, but it's highly recommended for production debugging.

