module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // note: react-native-reanimated/plugin must be last in this list
      "react-native-reanimated/plugin",
    ],
  }
}
