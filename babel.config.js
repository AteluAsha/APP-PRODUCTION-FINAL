/**
 * nativewind/babel + reanimated/plugin.
 *
 * babel-plugin-module-resolver: Metro/tsconfig `@/*` → `./*` in source (including
 * `require("@/assets/...")`). Without this, static asset requires under `@/` can
 * fail to bind on iOS while TypeScript still type-checks — global missing imagery.
 */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "babel-plugin-module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      ],
      // note: react-native-reanimated/plugin must be last in this list
      ["react-native-reanimated/plugin", { relativeSourceLocation: true }],
    ],
  }
}
