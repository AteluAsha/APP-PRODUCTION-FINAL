/**
 * EAS / prebuild: patch fmt 11.0.2 base.h when Apple Clang (Xcode 26+) rejects consteval.
 * Local ios/ is excluded from EAS archive — this plugin applies on generated Podfile.
 * @see https://github.com/expo/expo/issues/44229
 */
const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const MARKER = '# Xcode 26 workaround: disable fmt consteval'

const PATCH = `
    ${MARKER}
    fmt_base = File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      File.chmod(0644, fmt_base)
      content = File.read(fmt_base)
      patched = content.gsub(/#\\s*define FMT_USE_CONSTEVAL 1/, '# define FMT_USE_CONSTEVAL 0')
      if patched != content
        File.write(fmt_base, patched)
      end
    end
`

function withFmtConstevalWorkaround(config) {
    return withDangerousMod(config, [
        'ios',
        async (cfg) => {
            const podfilePath = path.join(
                cfg.modRequest.platformProjectRoot,
                'Podfile',
            )
            if (!fs.existsSync(podfilePath)) return cfg

            let content = fs.readFileSync(podfilePath, 'utf8')
            if (content.includes(MARKER)) return cfg

            const next = content.replace(
                /(react_native_post_install\([\s\S]*?\)\s*\n)/,
                `$1${PATCH}\n`,
            )
            if (next === content) {
                console.warn(
                    '[withFmtConstevalWorkaround] Podfile post_install hook not found',
                )
                return cfg
            }

            fs.writeFileSync(podfilePath, next)
            return cfg
        },
    ])
}

module.exports = withFmtConstevalWorkaround
