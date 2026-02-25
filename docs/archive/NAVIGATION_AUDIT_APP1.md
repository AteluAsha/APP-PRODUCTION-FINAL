# Navigation Audit - App 1 (Trial)

## Navigation Requirements

- All screens in App 1 (trial) should navigate back to ChakraHome
- ChakraHome is the central hub for trial users
- Being in the course should always get back to the correct chakra homescreen

## Screens to Audit

### 1. ChakraTemplate (Individual Chakra Day)

- **File**: `components/chakras/ChakraTemplate.tsx`
- **Navigation**: Uses `router.back()` ✅
- **Status**: Should work correctly if navigation stack is maintained
- **Action**: Verify it goes to ChakraHome

### 2. Chakras101

- **File**: `app/(chakras)/Chakras101.tsx`
- **Navigation**: Uses `router.replace('/(chakras)/ChakraHome')` ✅
- **Status**: CORRECT - explicitly goes to ChakraHome
- **Action**: ✅ No change needed

### 3. GalleryOfGnosis

- **File**: `app/(chakras)/GalleryOfGnosis.tsx`
- **Navigation**: Uses `ActionBar` which calls `router.back()`
- **Status**: Should work, but need to verify it goes to ChakraHome
- **Action**: Verify ActionBar navigation

### 4. SoundBath

- **File**: `app/(chakras)/SoundBath.tsx`
- **Navigation**: Uses `ActionBar` which calls `router.back()`
- **Invalid redirect**: `router.replace("/")` for invalid chakra
- **Status**: Should use ChakraHome instead of "/"
- **Action**: Fix invalid redirect

### 5. EnergyExchange

- **File**: `app/(chakras)/EnergyExchange.tsx`
- **Navigation**: Uses `router.replace('/(chakras)')` ❌
- **Status**: INCORRECT - should go to ChakraHome
- **Action**: Fix to use ChakraHome

### 6. HeadToHeart

- **File**: `app/(chakras)/HeadToHeart.tsx`
- **Navigation**: Need to check
- **Action**: Verify navigation

### 7. [chakra].tsx (Dynamic Route)

- **File**: `app/(chakras)/[chakra].tsx`
- **Navigation**: Uses `router.replace("/")` for invalid chakra ❌
- **Status**: INCORRECT - should go to ChakraHome
- **Action**: Fix invalid redirect

## Modals and Popups

### 1. GoodbyeModal

- **File**: `components/chakras/GoodbyeModal.tsx`
- **Navigation**: Closes modal, stays on ChakraHome ✅
- **Status**: Correct

### 2. WelcomeModal

- **File**: `components/chakras/WelcomeModal.tsx`
- **Navigation**: Closes modal, stays on ChakraHome ✅
- **Status**: Correct

### 3. AnuaChatModal

- **File**: `components/social/AnuaChatModal.tsx`
- **Navigation**: Has close button ✅
- **Status**: Correct

### 4. InviteFriendModal

- **File**: `components/invite/InviteFriendModal.tsx`
- **Navigation**: Has close button ✅
- **Status**: Correct (now simplified to native share)

## ActionBar Component

- **File**: `components/ActionBar.tsx`
- **Navigation**: Uses `router.back()`
- **Status**: Should work if navigation stack is maintained
- **Action**: Verify it works correctly

## Issues Found

1. ❌ EnergyExchange: Uses `router.replace('/(chakras)')` - should use ChakraHome
2. ❌ SoundBath: Uses `router.replace("/")` for invalid chakra - should use ChakraHome
3. ❌ [chakra].tsx: Uses `router.replace("/")` for invalid chakra - should use ChakraHome

## Fixes Needed

1. Fix EnergyExchange navigation
2. Fix SoundBath invalid redirect
3. Fix [chakra].tsx invalid redirect
4. Verify all ActionBar navigation goes to ChakraHome
