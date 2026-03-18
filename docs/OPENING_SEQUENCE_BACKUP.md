# Opening sequence backup (pre–surgical rebuild)

This document describes the opening flow **before** the surgical rebuild that moved the splash into (chakras) index. Use it to restore or compare behavior if needed.

## Flow (before rebuild)

1. **splash-keeper** (`src/utils/splash-keeper.ts`) – imported first in _layout; calls `SplashScreen.preventAutoHideAsync()` so the native splash stays visible until we hide it.
2. **_layout** – RootLayout:
   - `nativeReady`: starts `false`; set `true` after `requestAnimationFrame` + 80ms delay (both platforms). If `!nativeReady`, return a transparent View (native splash remains visible).
   - `showHeroLogo`: starts `true`. If `showHeroLogo`, return full-screen black View with `<SplashScreenReveal />` (onAnimationComplete → handleHeroLogoComplete; onFadeInComplete / onFirstPaint → hide native splash via ref).
   - 8s safety timeout: if still on hero splash, force `setShowHeroLogo(false)` and hide native splash.
   - When `showHeroLogo` becomes false: return `<ErrorBoundary fallback={errorFallback}>` (hero logo Image) wrapping ThemeProvider, GestureHandlerRootView, BottomSheetModalProvider, View (black), **Animated.View (FadeIn)**, Stack, etc.
3. **index** ((chakras)/index.tsx) – Renders `<StillnessScreen />`. useEffect waits for `storeRehydrationReady` and `rootNavigationState?.key`, then `router.replace` to WelcomeScreen / ChakraHub / DateSelection / ChakraHome.

So “before welcome” = splash-keeper → _layout (nativeReady → transparent view, then showHeroLogo → SplashScreenReveal, then main app with FadeIn and ErrorBoundary with hero-logo fallback) → index (StillnessScreen + rehydration + replace).

## Key code snippets (for restore reference)

### _layout.tsx – nativeReady effect (kept after rebuild)

```ts
useEffect(() => {
  const delay = Platform.OS === "ios" ? 80 : 80
  let cancelled = false
  const id = requestAnimationFrame(() => {
    if (cancelled) return
    if (delay > 0) {
      setTimeout(() => {
        if (!cancelled) setNativeReady(true)
      }, delay)
    } else {
      setNativeReady(true)
    }
  })
  return () => {
    cancelled = true
    cancelAnimationFrame(id)
  }
}, [])
```

### _layout.tsx – showHeroLogo block (removed in rebuild)

```ts
if (showHeroLogo) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <SplashScreenReveal
        onAnimationComplete={handleHeroLogoComplete}
        onFadeInComplete={handleHeroFadeInComplete}
        onFirstPaint={() => { ... }}
        assetsReady={assetsReady}
      />
    </View>
  )
}
```

### _layout.tsx – custom error fallback (removed; ErrorBoundary default is black + alpha/omega)

```ts
const errorFallback = (
  <View style={errorFallbackStyles.container}>
    <View style={errorFallbackStyles.logoContainer}>
      <Image source={require("../assets/images/SoulSchool_HERO_Logo.png")} ... />
    </View>
  </View>
)
// Used as: <ErrorBoundary fallback={errorFallback}>
```

### _layout.tsx – main return (FadeIn removed in rebuild)

```ts
<Animated.View
  style={{ flex: 1 }}
  entering={FadeIn.duration(SOMATIC_FADE_IN_MS).easing(Easing.out(Easing.ease))}
>
  <Stack> ... </Stack>
  ...
</Animated.View>
```

### index.tsx – render and redirect effect (unchanged logic; splash phase added in rebuild)

```ts
return <StillnessScreen />

useEffect(() => {
  if (!storeRehydrationReady) return
  if (!rootNavigationState?.key) return
  if (hasLifetimeAccess) { router.replace("/(chakras)/ChakraHub"); return }
  ...
  router.replace("/(chakras)/WelcomeScreen")
}, [storeRehydrationReady, rootNavigationState?.key, ...])
```

## After rebuild

- Splash runs **once** in (chakras) index: phase `splash` → SplashScreenReveal → onAnimationComplete hides native splash and setPhase(`stillness`) → StillnessScreen until rehydration → replace.
- _layout no longer renders SplashScreenReveal; it only does nativeReady → main app (Stack). ErrorBoundary has no custom fallback (default = black + α Ω).

## Optional: if error screen appears on open

If the app shows an error screen (e.g. black + alpha/omega from ErrorBoundary default) on cold start, add logging in `components/ErrorBoundary.tsx` in `componentDidCatch` (e.g. log `error` and `errorInfo.componentStack`) to identify the thrown error and fix the root cause.
