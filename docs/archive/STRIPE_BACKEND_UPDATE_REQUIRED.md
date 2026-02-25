# ⚠️ Backend Stripe Secret Key Update Required

## Critical Action Needed

The Stripe **secret key** must be updated on your **backend server** (separate from this mobile app repository).

## Backend Secret Key

```
STRIPE_SECRET_KEY=[KEY_REDACTED_FOR_SECURITY]
```

## Where to Update

Since this is a mobile-only repository, your backend server is hosted separately. Update the secret key in your backend's environment variables:

### Common Backend Platforms:

1. **Firebase Functions:**

   ```bash
   firebase functions:config:set stripe.secret_key="[KEY_REDACTED_FOR_SECURITY]"
   ```

2. **Vercel:**
   - Go to Project Settings → Environment Variables
   - Update or create `STRIPE_SECRET_KEY`
   - Redeploy functions

3. **Netlify:**
   - Go to Site Settings → Environment Variables
   - Update or create `STRIPE_SECRET_KEY`
   - Redeploy site

4. **AWS Lambda:**
   - Update in Lambda function configuration → Environment variables
   - Or via AWS CLI/Console

5. **Other Platforms:**
   - Update according to your platform's environment variable management system

## Verification

After updating, verify your backend code loads the secret key correctly:

```javascript
// Example backend initialization
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
```

## Status

✅ **Mobile App (.env):** Updated  
✅ **EAS Build Secrets:** Updated  
⚠️ **Backend Server:** **REQUIRES MANUAL UPDATE** (not in this repository)

---

**Note:** The backend update must be completed separately as it's hosted outside this mobile app repository.
