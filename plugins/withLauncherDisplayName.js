/**
 * Home-screen launcher label (under the icon).
 *
 * Expo `name` is the store title. This plugin keeps:
 * - Android `app_name` in strings.xml after prebuild overwrites it from config.name
 * - iOS CFBundleDisplayName / CFBundleName (Apple home-screen label)
 */
const { withStringsXml, withInfoPlist, AndroidConfig } = require("@expo/config-plugins")

const LAUNCHER_NAME = "Awakening Soul"

function withLauncherDisplayName(config) {
  config = withStringsXml(config, (cfg) => {
    cfg.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: "app_name" }, _: LAUNCHER_NAME }],
      cfg.modResults,
    )
    return cfg
  })

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.CFBundleDisplayName = LAUNCHER_NAME
    cfg.modResults.CFBundleName = LAUNCHER_NAME
    return cfg
  })

  return config
}

module.exports = withLauncherDisplayName
