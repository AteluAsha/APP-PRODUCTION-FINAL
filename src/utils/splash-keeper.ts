/**
 * Keep native splash visible until our hero transition runs.
 * Import this first in root _layout so it runs before any component tree.
 * See: https://docs.expo.dev/versions/latest/sdk/splash-screen/
 */
import * as SplashScreen from "expo-splash-screen"

SplashScreen.preventAutoHideAsync().catch(() => {})
