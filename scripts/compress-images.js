/**
 * Aggressive but safe image compression for ./assets only (does NOT touch app/backups).
 *
 * - Resize: any image wider than 2048px → resize to 2048px width (aspect ratio preserved).
 * - PNG: lossy palette compression (quality 80, palette) for ~60–70% size reduction.
 * - JPEG: quality 75, mozjpeg.
 *
 * Usage (from project root):
 *   node scripts/compress-images.js
 *
 * Requires: npm install sharp (or already in devDependencies)
 */

const fs = require("fs")
const path = require("path")

const ASSETS_DIR = path.join(__dirname, "..", "assets")
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg"])
const MAX_WIDTH_PX = 2048

function getImagePaths(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      getImagePaths(full, acc)
    } else if (IMAGE_EXT.has(path.extname(e.name).toLowerCase())) {
      acc.push(full)
    }
  }
  return acc
}

async function main() {
  const sharp = require("sharp")

  const assetsDir = path.resolve(ASSETS_DIR)
  if (!fs.existsSync(assetsDir)) {
    console.error("[compress-images] ./assets not found.")
    process.exit(1)
  }

  const files = getImagePaths(assetsDir)
  if (files.length === 0) {
    console.log(
      "[compress-images] No .png / .jpg / .jpeg files found under ./assets",
    )
    return
  }

  console.log(
    "[compress-images] Aggressive compression – ./assets only (backups not touched)\n",
  )
  console.log(
    `Settings: resize if width > ${MAX_WIDTH_PX}px | PNG lossy (quality 80, palette) | JPEG quality 75\n`,
  )
  console.log(`Found ${files.length} image(s).\n`)

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

      // Resize if wider than MAX_WIDTH_PX (maintain aspect ratio)
      if (width > MAX_WIDTH_PX) {
        pipeline = pipeline.resize(MAX_WIDTH_PX, null, {
          withoutEnlargement: true,
        })
      }

      if (ext === ".png") {
        // Lossy: palette + quality 80 (Sharp uses lowest colours needed for this quality; keeps alpha)
        pipeline = pipeline.png({
          quality: 80,
          palette: true,
          compressionLevel: 9,
          effort: 10,
          dither: 1.0,
        })
      } else {
        pipeline = pipeline.jpeg({ quality: 75, mozjpeg: true })
      }

      const buf = await pipeline.toBuffer()
      const afterBytes = buf.length

      if (afterBytes < beforeBytes) {
        fs.writeFileSync(filePath, buf)
      }
      const afterSize = afterBytes < beforeBytes ? afterBytes : beforeBytes
      totalAfter += afterSize

      const beforeMB = (beforeBytes / 1024 / 1024).toFixed(2)
      const afterMB = (afterSize / 1024 / 1024).toFixed(2)
      const savedMB = ((beforeBytes - afterSize) / 1024 / 1024).toFixed(2)
      const resized = width > MAX_WIDTH_PX ? ` [resized from ${width}px]` : ""
      console.log(`${rel}${resized}`)
      console.log(
        `  Before: ${beforeMB} MB  →  After: ${afterMB} MB  (saved ${savedMB} MB)`,
      )
    } catch (err) {
      totalAfter += beforeBytes
      failures.push({ rel, error: err.message })
      console.log(`${rel}\n  ERROR: ${err.message}`)
    }
  }

  const totalSavedMB = (totalBefore - totalAfter) / 1024 / 1024
  console.log("\n--- Summary ---")
  console.log(`Total Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total After:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total saved:  ${totalSavedMB.toFixed(2)} MB`)
  if (failures.length) {
    console.log(`\n${failures.length} file(s) had errors.`)
  }
}

main().catch((e) => {
  console.error("[compress-images]", e)
  process.exit(1)
})
