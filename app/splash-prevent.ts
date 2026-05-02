/**
 * Register splash hold before any React render. Android 12+ can dismiss the native
 * "7" shield on first frame if preventAutoHideAsync() only runs in useEffect.
 */
import * as SplashScreen from "expo-splash-screen"

void SplashScreen.preventAutoHideAsync().catch(() => {})
