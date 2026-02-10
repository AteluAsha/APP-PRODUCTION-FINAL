/**
 * Babel config – Use top-level react-native-css-interop/babel so className and
 * Tailwind compile correctly. "nativewind/babel" resolves to nested
 * nativewind/node_modules/react-native-css-interop (0.2.1) which requires
 * react-native-worklets/plugin; the top-level css-interop (0.1.22) uses
 * react-native-reanimated/plugin and matches the original working setup.
 */
module.exports = function (api) {
  api.cache(true)
  const cssInteropBabel = require("react-native-css-interop/babel")()
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      { plugins: cssInteropBabel.plugins },
    ],
    plugins: [],
  }
}
