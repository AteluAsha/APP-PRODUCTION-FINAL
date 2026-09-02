/**
 * Cloud EAS only: bump npm to 11 so npm ci matches the lockfile.
 * Local macOS builds already have npm 11 and cannot write /usr/local (EACCES).
 */
const { execSync } = require('child_process')

const cwd = process.cwd()
const workdir =
    process.env.EAS_BUILD_WORKINGDIR ||
    process.env.EAS_LOCAL_BUILD_WORKINGDIR ||
    ''

if (
    cwd.includes('eas-build-local-nodejs') ||
    workdir.includes('eas-build-local-nodejs')
) {
    const fs = require('fs')
    const path = require('path')
    const dest = path.join(cwd, 'google-services.json')
    const src = process.env.GOOGLE_SERVICES_JSON
    if (!fs.existsSync(dest) && src && fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
        console.log('[eas-build-pre-install] copied google-services.json for local prebuild')
    }
    console.log('[eas-build-pre-install] local build — skip global npm upgrade')
    process.exit(0)
}

let npmVersion = 'unknown'
try {
    npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim()
} catch {
    npmVersion = '0.0.0'
}

const major = parseInt(npmVersion.split('.')[0], 10) || 0
if (major >= 11) {
    console.log(`[eas-build-pre-install] npm ${npmVersion} already OK — skip`)
    process.exit(0)
}

console.log('[eas-build-pre-install] upgrading to npm@11.11.0')
execSync('npm install -g npm@11.11.0', { stdio: 'inherit' })
