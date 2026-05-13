import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

/**
 * Resize/compress large event photos in `public/Hitouch Pictures`.
 * The carousel never renders these wider than ~1400px (full-bleed),
 * so 1920px wide at q82 progressive mozjpeg is a comfortable ceiling.
 *
 * Run: npm run images:optimize-events
 */
const dir = path.join(process.cwd(), "public", "Hitouch Pictures")
const maxW = 1920
const quality = 82
const minBytes = 600_000

if (!fs.existsSync(dir)) {
  console.error("Directory not found:", dir)
  process.exit(1)
}

for (const file of fs.readdirSync(dir)) {
  if (!/\.(jpe?g)$/i.test(file) || file.endsWith(".tmp")) continue
  const full = path.join(dir, file)
  const before = fs.statSync(full).size
  if (before < minBytes) continue

  const outPath = full
  const tmp = outPath + ".opt.tmp"

  const meta = await sharp(full).metadata()
  let pipeline = sharp(full).rotate()
  if (meta.width && meta.width > maxW) {
    pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true })
  }

  await pipeline
    .jpeg({ quality, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" })
    .toFile(tmp)

  if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  fs.renameSync(tmp, outPath)

  const after = fs.statSync(outPath).size
  const pct = ((1 - after / before) * 100).toFixed(1)
  console.log(`optimized ${file}  ${(before / 1e6).toFixed(2)}MB -> ${(after / 1e6).toFixed(2)}MB  (-${pct}%)`)
}
