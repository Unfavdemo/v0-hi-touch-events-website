import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

/**
 * Resize/compress large event photos:
 *  - cover photos in `public/Hitouch Pictures/*.jpg`
 *  - per-project gallery photos in `public/images/featured-work/{slug}/*.jpg`
 *
 * The carousel never renders these wider than ~1400px, so 1920px at q82
 * progressive mozjpeg is a comfortable ceiling for retina screens.
 *
 * Run: npm run images:optimize-events
 */
const maxW = 1920
const quality = 82
const minBytes = 600_000

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

async function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
      continue
    }
    if (!entry.isFile()) continue
    if (!/\.(jpe?g)$/i.test(entry.name) || entry.name.endsWith(".tmp")) continue

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
    const rel = path.relative(process.cwd(), full).replace(/\\/g, "/")
    const pct = ((1 - after / before) * 100).toFixed(1)
    console.log(
      `optimized ${rel}  ${(before / 1e6).toFixed(2)}MB -> ${(after / 1e6).toFixed(2)}MB  (-${pct}%)`,
    )
  }
}
