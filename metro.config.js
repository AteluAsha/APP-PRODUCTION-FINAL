const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname, { isCSSEnabled: true })

const { transformer, resolver } = config

// Resolve against THIS working tree. require.resolve() bakes an absolute
// path from a previous EAS temp dir into every import(), and the next
// local Play bundle dies looking for a folder that no longer exists.
const asyncRequireModulePath = path.join(
    __dirname,
    "node_modules/@expo/metro-config/build/async-require.js",
)

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
  asyncRequireModulePath,
}
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
}

config.resetCache = true
config.cacheVersion = "soul-school-1.2.2-44-isolated-async-require"

const withCss = withNativeWind(config, { input: "./globals.css" })
withCss.resetCache = true
withCss.cacheVersion = "soul-school-1.2.2-44-isolated-async-require"
if (withCss.transformer) {
  withCss.transformer.asyncRequireModulePath = asyncRequireModulePath
}

// Pin the transform cache inside this tree so a later EAS local working
// dir cannot reuse /tmp/metro-cache entries that still point at a deleted
// UUID folder.
try {
  const { FileStore } = require("metro-cache")
  withCss.cacheStores = [
    new FileStore({
      root: path.join(__dirname, "node_modules/.cache/metro-eas"),
    }),
  ]
} catch {
  // metro-cache is always present in Expo 53; ignore if a test runner
  // loads this file without it.
}

module.exports = withCss
