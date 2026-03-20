/**
 * Restored to initial (ea10bb5) config – nativewind/babel + reanimated/plugin.
 * This was the working setup before HERO's css-interop switch broke styling.
 */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // NativeWind / css-interop metro chain expects this module (Expo SDK 53+).
      // Must run before react-native-reanimated/plugin.
      "react-native-worklets/plugin",
      // note: react-native-reanimated/plugin must be last in this list
      ["react-native-reanimated/plugin", { relativeSourceLocation: true }],
    ],
  }
}
