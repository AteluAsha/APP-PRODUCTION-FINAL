#!/usr/bin/env node
/**
 * Ensures node_modules/react-native-worklets/plugin.js exists so the nested
 * NativeWind css-interop babel config can require('react-native-worklets/plugin').
 * We use Reanimated 3; the no-op plugin satisfies the require without adding Reanimated 4.
 */
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const dir = path.join(root, "node_modules", "react-native-worklets")
const realPlugin = path.join(dir, "plugin", "index.js")
const pluginPath = path.join(dir, "plugin.js")
const pkgPath = path.join(dir, "package.json")

// Real npm package ships plugin at plugin/index.js — do not overwrite with stub.
if (fs.existsSync(realPlugin)) {
  process.exit(0)
}

const pluginContent = `/**
 * Stub for "react-native-worklets/plugin" so NativeWind's nested
 * react-native-css-interop (which expects Reanimated 4) can load.
 * We use Reanimated 3 and already have react-native-reanimated/plugin in babel.config.js.
 * This no-op plugin satisfies the require() so the bundle builds.
 */
module.exports = function () {
  return { visitor: {} }
}
`

const pkgContent = JSON.stringify(
  {
    name: "react-native-worklets",
    version: "0.0.0-stub",
    private: true,
    description:
      "Stub for NativeWind css-interop babel chain (project uses Reanimated 3)",
  },
  null,
  2,
)

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
if (
  !fs.existsSync(pluginPath) ||
  fs.readFileSync(pluginPath, "utf8") !== pluginContent
) {
  fs.writeFileSync(pluginPath, pluginContent)
}
if (
  !fs.existsSync(pkgPath) ||
  fs.readFileSync(pkgPath, "utf8") !== pkgContent
) {
  fs.writeFileSync(pkgPath, pkgContent)
}
