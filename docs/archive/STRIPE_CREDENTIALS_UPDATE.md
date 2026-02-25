# Stripe Credentials Hot Swap - Non-Profit Account Migration

## ✅ Update Completed

This document tracks the hot swap of Stripe credentials from personal account to non-profit account.

## New Credentials (Live Keys)

**Publishable Key (Client-Side):**

```
[KEY_REDACTED_FOR_SECURITY]
```

**Secret Key (Backend Only):**

```
[KEY_REDACTED_FOR_SECURITY]
```

## Files Updated

1. **`app.config.js`** ✅
   - Configuration already reads from `process.env.STRIPE_PUBLISHABLE_KEY`
   - No code changes needed - just update environment variables

## Required Actions

### 1. Update Local Development (.env file)

Add or update these lines in your `.env` file (in project root):

```bash
STRIPE_PUBLISHABLE_KEY=[KEY_REDACTED_FOR_SECURITY]
```

**Note:** The secret key (`STRIPE_SECRET_KEY`) should NOT be in the `.env` file. It must be stored securely on your backend server.

### 2. Update EAS Build Environment Variables

For production builds via EAS (Expo Application Services):

1. **Login to EAS:**

   ```bash
   eas login
   ```

2. **Set the publishable key:**

   ```bash
   eas secret:create --scope project --name STRIPE_PUBLISHABLE_KEY --value [KEY_REDACTED_FOR_SECURITY]
   ```

3. **Verify the secret was created:**
   ```bash
   eas secret:list
   ```

### 3. Update Backend Server Environment Variables

**CRITICAL:** The Stripe secret key must be updated on your backend server (wherever your serverless functions or API routes are hosted).

**Backend Environment Variables to Update:**

```bash
STRIPE_SECRET_KEY=[KEY_REDACTED_FOR_SECURITY]
```

**Backend Platforms:**

- **Vercel:** Update in Project Settings → Environment Variables
- **Netlify:** Update in Site Settings → Environment Variables
- **Firebase Functions:** Update via `firebase functions:config:set`
- **AWS Lambda:** Update in Lambda function environment variables
- **Other:** Update according to your platform's environment variable management

### 4. Verify Backend Payment Initialization

Ensure your backend payment initialization code loads the secret key correctly:

```javascript
// Example backend code (adjust for your platform)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
```

**Verification Checklist:**

- ✅ Backend reads `STRIPE_SECRET_KEY` from environment variables
- ✅ No hardcoded keys in backend code
- ✅ Backend uses the new secret key for all Stripe API calls
- ✅ Payment webhooks are configured for the new account

### 5. Test Payment Flow

After updating credentials:

1. **Test in Development:**
   - Update `.env` file with new publishable key
   - Restart development server: `npx expo start --clear`
   - Test payment flow in development

2. **Test in Production:**
   - Create a new EAS build with updated secrets
   - Test payment flow in production build
   - Verify transactions appear in new Stripe account dashboard

### 6. Deploy Updated Build

Once credentials are updated and tested:

```bash
# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Or submit directly to stores
eas submit --platform ios
eas submit --platform android
```

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env` files to git (already in `.gitignore`)
- Never expose the secret key in client-side code
- Secret key must only exist on backend servers
- Publishable key is safe to expose in mobile app

## Verification

After deployment, verify:

- ✅ Payments process successfully
- ✅ Transactions appear in new Stripe dashboard
- ✅ Webhooks are received (if configured)
- ✅ No errors in payment flow
- ✅ Old account is no longer receiving transactions

## Rollback Plan

If issues occur, you can rollback by:

1. Reverting environment variables to old credentials
2. Redeploying backend with old secret key
3. Creating new EAS build with old publishable key

---

**Update Date:** $(date)
**Status:** ✅ Code ready, awaiting environment variable updates
