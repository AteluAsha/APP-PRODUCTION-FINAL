/**
 * Image compression script – targets ./assets only (safety net: app/backups is never touched).
 *
 * Uses sharp (devDependency) to compress PNG and JPEG under assets/images and assets/*.
 * Skips: SVGs, non-image files, and anything outside ./assets.
 *
 * Usage:
 *   node scripts/compress-assets.js           # run compression (overwrites in place)
 *   node scripts/compress-assets.js --dry-run  # show what would be compressed, no writes
 */

const fs = require("fs")
const path = require("path")

const ASSETS_DIR = path.join(__dirname, "..", "assets")
const DRY_RUN = process.argv.includes("--dry-run")

// Only process these extensions
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg"])

async function getImagePaths(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      await getImagePaths(full, acc)
    } else if (IMAGE_EXT.has(path.extname(e.name).toLowerCase())) {
      acc.push(full)
    }
  }
  return acc
}

async function main() {
  const sharp = require("sharp")

  // Ensure we only ever run under ./assets (never app/backups)
  const assetsDir = path.resolve(ASSETS_DIR)
  const cwd = path.resolve(process.cwd())
  const assetsRelative = path.relative(cwd, assetsDir)
  if (assetsRelative.startsWith("..") || path.isAbsolute(assetsRelative)) {
    console.error(
      "[compress-assets] Must be run from project root so ./assets is current assets folder.",
    )
    process.exit(1)
  }
  if (!fs.existsSync(assetsDir)) {
    console.error("[compress-assets] ./assets not found.")
    process.exit(1)
  }

  const files = await getImagePaths(assetsDir)
  if (files.length === 0) {
    console.log("[compress-assets] No PNG/JPEG files found under ./assets")
    return
  }

  console.log(`[compress-assets] Found ${files.length} image(s) under ./assets`)
  if (DRY_RUN)
    console.log("[compress-assets] DRY RUN – no files will be modified.\n")

  let totalBefore = 0
  let totalAfter = 0
  const failures = []

  for (const filePath of files) {
    const rel = path.relative(assetsDir, filePath)
    const ext = path.extname(filePath).toLowerCase()
    let beforeBytes
    try {
      beforeBytes = fs.statSync(filePath).size
    } catch (e) {
      failures.push({ rel, error: e.message })
      continue
    }
    totalBefore += beforeBytes

    try {
      let pipeline = sharp(filePath)
      const meta = await pipeline.metadata()
      const width = meta.width || 0
      const height = meta.height || 0

      if (ext === ".png") {
        pipeline = pipeline.png({
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
      } else {
        pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true })
      }

      const buf = await pipeline.toBuffer()
      const afterBytes = buf.length
      const kept =
        !DRY_RUN && afterBytes < beforeBytes ? afterBytes : beforeBytes
      totalAfter += kept

      if (!DRY_RUN && afterBytes < beforeBytes) {
        fs.writeFileSync(filePath, buf)
      }
      const pct =
        beforeBytes > 0 ? ((1 - afterBytes / beforeBytes) * 100).toFixed(1) : 0
      const action =
        afterBytes >= beforeBytes
          ? "skipped (no gain or would be larger)"
          : DRY_RUN
            ? "(dry-run)"
            : "written"
      console.log(
        `  ${rel}: ${(beforeBytes / 1024).toFixed(1)} KB → ${(afterBytes / 1024).toFixed(1)} KB (${pct}% smaller) ${action}`,
      )
    } catch (err) {
      totalAfter += beforeBytes
      failures.push({ rel, error: err.message })
      console.log(`  ${rel}: ERROR – ${err.message}`)
    }
  }

  if (failures.length) {
    console.log(`\n[compress-assets] ${failures.length} file(s) had errors.`)
  }
  const saved = totalBefore - totalAfter
  console.log(
    `\n[compress-assets] Total: ${(totalBefore / 1024 / 1024).toFixed(2)} MB → ${(totalAfter / 1024 / 1024).toFixed(2)} MB (saved ${(saved / 1024).toFixed(1)} KB)`,
  )
  if (DRY_RUN && saved > 0) {
    console.log("[compress-assets] Run without --dry-run to apply compression.")
  }
}

main().catch((e) => {
  console.error("[compress-assets]", e)
  process.exit(1)
})
