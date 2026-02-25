# RevenueCat Integration Setup Guide

## Overview

This app uses RevenueCat for in-app purchases and subscription management. The integration is complete and ready for configuration in the RevenueCat dashboard.

## Important Note: SDK Selection

**This is a React Native/Expo app**, so we're using `react-native-purchases` (not the web SDK). The React Native SDK handles both iOS and Android purchases natively.

## Installation

The RevenueCat SDK has been added to `package.json`. To install:

```bash
npm install
```

For Expo projects, you may also need to run:

```bash
npx expo prebuild
```

## Configuration

### 1. RevenueCat Dashboard Setup

1. **Create/Login to RevenueCat Account**: https://app.revenuecat.com
2. **Create a New Project** (if needed)
3. **Add Your App**:
   - iOS: Add your iOS app bundle ID
   - Android: Add your Android package name

### 2. API Keys

The test API key is configured in `src/services/revenuecat.ts`:

- **Test Key**: `test_mRXcQRdcjNOlGKcnkObBOFYjtYi`

**Important**: Replace this with your production API key when ready:

- Get your API keys from: RevenueCat Dashboard → Project Settings → API Keys
- Update `REVENUECAT_API_KEY` in `src/services/revenuecat.ts`

### 3. Product Configuration

In the RevenueCat Dashboard, configure these products:

#### Product Identifiers:

- `yearly` - Annual subscription (lifetime access)
- `lifetime` - Lifetime access (via annual payment or scholarship)

**Note:** There is no monthly subscription option - only annual and scholarship paths are available.

#### Setup Steps:

1. **Go to Products** in RevenueCat Dashboard
2. **Create Products** with the identifiers above
3. **Link to App Store Connect / Google Play Console**:
   - iOS: Link to your products in App Store Connect
   - Android: Link to your products in Google Play Console

### 4. Entitlement Configuration

Create an entitlement called **"Soul School Pro"**:

1. **Go to Entitlements** in RevenueCat Dashboard
2. **Create Entitlement**: `Soul School Pro`
3. **Attach Products**: Link both products (yearly, lifetime) to this entitlement

### 5. Offerings Setup (Optional but Recommended)

Create an offering to group your products:

1. **Go to Offerings** in RevenueCat Dashboard
2. **Create Default Offering**
3. **Add Packages**:
   - Annual Package → `yearly` product
   - Lifetime Package → `lifetime` product

**Note:** No monthly package is needed - only annual and lifetime options.

## App Store Connect / Google Play Console Setup

### iOS (App Store Connect)

1. **Create In-App Purchase Products**:
   - Annual Subscription (Auto-Renewable Subscription) - provides lifetime access
   - Lifetime Purchase (Non-Consumable) - for scholarship path

2. **Product IDs** must match RevenueCat product identifiers:
   - `yearly` - Annual subscription
   - `lifetime` - Lifetime access

**Note:** No monthly subscription product is needed.

3. **Link to RevenueCat**: RevenueCat will automatically sync products

### Android (Google Play Console)

1. **Create Products**:
   - Annual Subscription - provides lifetime access
   - Lifetime Purchase (One-time product) - for scholarship path

2. **Product IDs** must match RevenueCat product identifiers:
   - `yearly` - Annual subscription
   - `lifetime` - Lifetime access

**Note:** No monthly subscription product is needed.

3. **Link to RevenueCat**: RevenueCat will automatically sync products

## Code Structure

### Service Layer

- **`src/services/revenuecat.ts`**: Core RevenueCat service with all purchase functions

### Hooks

- **`hooks/useRevenueCat.ts`**: React hook for managing purchases and entitlements

### Components

- **`components/chakras/RevenueCatPaywall.tsx`**: Full paywall with all subscription options
- **`components/chakras/PaymentGate.tsx`**: Payment gate integrated with RevenueCat

## Key Features Implemented

✅ **Entitlement Checking**: Checks for "Soul School Pro" entitlement  
✅ **Product Purchases**: Supports annual and lifetime products  
✅ **Customer Info**: Retrieves and manages customer information  
✅ **Restore Purchases**: Allows users to restore previous purchases  
✅ **Customer Center**: Opens native subscription management  
✅ **Error Handling**: Comprehensive error handling throughout  
✅ **Integration**: Automatically grants lifetime access when purchase succeeds

## Testing

### Sandbox Testing

1. **iOS**: Use sandbox test accounts in App Store Connect
2. **Android**: Use license testing accounts in Google Play Console

### Test Flow

1. App initializes RevenueCat on startup
2. Payment gate appears on Day 14 (second trial Sunday)
3. User can purchase lifetime access ($7)
4. Purchase grants "Soul School Pro" entitlement
5. Entitlement automatically grants lifetime access in app

## Production Checklist

- [ ] Replace test API key with production key
- [ ] Configure products in App Store Connect / Google Play Console
- [ ] Create products in RevenueCat Dashboard
- [ ] Create "Soul School Pro" entitlement
- [ ] Link products to entitlement
- [ ] Test purchases in sandbox environment
- [ ] Test restore purchases functionality
- [ ] Test customer center functionality
- [ ] Verify entitlement checking works correctly

## Troubleshooting

### Common Issues

1. **"Product not found"**: Ensure product IDs match exactly in RevenueCat and App Store/Play Console
2. **"Purchase failed"**: Check that products are approved and available in App Store/Play Console
3. **"Entitlement not active"**: Verify entitlement is created and products are linked to it

### Debug Mode

Debug logging is enabled in development mode. Check console for detailed RevenueCat logs.

## Documentation

- RevenueCat React Native SDK: https://www.revenuecat.com/docs/react-native
- RevenueCat Dashboard: https://app.revenuecat.com
- RevenueCat Support: https://www.revenuecat.com/docs
