import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

/**
 * Resize/compress event JPEGs with Sharp:
 *  - `public/Hitouch Pictures/*.jpg` — large files / wide originals (carousel & case heroes).
 *  - `public/images/featured-work/{slug}/01.jpg` … `06.jpg` — stricter ceiling (grids + lightbox).
 *
 * Run: npm run images:optimize-events
 */
const maxWHitouch = 1920
const maxWGallery = 1600
const quality = 82
const minBytesHitouch = 600_000
/** Gallery slots: re-encode when this small or wider than maxWGallery (updated batches are often heavy). */
const minBytesGallery = 40_000

const targets = [
  path.join(process.cwd(), "public", "Hitouch Pictures"),
  path.join(process.cwd(), "public", "images", "featured-work"),
]

let totalBefore = 0
let totalAfter = 0
let optimizedCount = 0

for (const root of targets) {
  if (!fs.existsSync(root)) {
    console.warn("Skipping (not found):", root)
    continue
  }
  await walk(root)
}

console.log(
  `\nDone. Optimized ${optimizedCount} file(s)  ${(totalBefore / 1e6).toFixed(2)}MB -> ${(
    totalAfter / 1e6
  ).toFixed(2)}MB  (-${
    totalBefore === 0 ? "0.0" : ((1 - totalAfter / totalBefore) * 100).toFixed(1)
  }%)`,
)

function isGallerySlot(relPosix) {
  return /featured-work\/[^/]+\/0[1-6]\.jpe?g$/i.test(relPosix)
}

async function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
      continue
    }
    if (!entry.isFile()) continue
    if (!/\.(jpe?g)$/i.test(entry.name) || entry.name.endsWith(".tmp")) continue

    const rel = path.relative(process.cwd(), full).replace(/\\/g, "/")
    const gallerySlot = isGallerySlot(rel)
    const maxW = gallerySlot ? maxWGallery : maxWHitouch
    const minBytes = gallerySlot ? minBytesGallery : minBytesHitouch

    const before = fs.statSync(full).size
    const meta = await sharp(full).metadata()
    const isOversize = meta.width && meta.width > maxW
    if (before < minBytes && !isOversize) continue

    const tmp = full + ".opt.tmp"
    let pipeline = sharp(full).rotate()
    if (isOversize) {
      pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true })
    }

    await pipeline
      .jpeg({ quality, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" })
      .toFile(tmp)

    if (fs.existsSync(full)) fs.unlinkSync(full)
    fs.renameSync(tmp, full)

    const after = fs.statSync(full).size
    totalBefore += before
    totalAfter += after
    optimizedCount += 1
    const pct = ((1 - after / before) * 100).toFixed(1)
    console.log(
      `optimized ${rel}  ${(before / 1e6).toFixed(2)}MB -> ${(after / 1e6).toFixed(2)}MB  (-${pct}%)${gallerySlot ? "  [gallery]" : ""}`,
    )
  }
}
