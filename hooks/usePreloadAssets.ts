import { useState, useEffect } from "react"
import { Asset } from "expo-asset"

/**
 * Hook to preload critical assets on app startup
 *
 * OPTIMIZATION: Only preload essential UI assets to reduce initial load time.
 * Large images (>2MB) should be loaded from Firebase Storage on-demand.
 *
 * @param assets - Array of asset module references (from require())
 * @returns boolean indicating if assets are loaded
 */
export function usePreloadAssets(assets: number[]): boolean {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function preload() {
      try {
        // Preload assets in parallel for faster loading
        // Only preload critical assets - large images should come from Firebase
        const cacheAssets = assets.map((asset) =>
          Asset.fromModule(asset).downloadAsync(),
        )
        await Promise.all(cacheAssets)
      } catch (error) {
        // Don't block app startup if asset preloading fails
        // Log in dev mode only
        if (__DEV__) {
          console.warn("Error preloading assets:", error)
        }
      } finally {
        setIsReady(true)
      }
    }

    preload()
  }, [assets])

  return isReady
}
