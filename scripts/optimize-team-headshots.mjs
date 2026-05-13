import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

/** Resize/compress large headshots in `public/images/team`. Run: npm run images:optimize-team */
const dir = path.join(process.cwd(), "public", "images", "team")
const maxW = 1200
const minBytes = 350_000

for (const file of fs.readdirSync(dir)) {
  if (!/\.(jpe?g|png)$/i.test(file) || file.endsWith(".tmp")) continue
  const full = path.join(dir, file)
  if (fs.statSync(full).size < minBytes) continue
  const ext = path.extname(file).toLowerCase()
  const outPath = ext === ".png" ? full.replace(/\.png$/i, ".jpg") : full
  const tmp = outPath + ".opt.tmp"

  let pipeline = sharp(full)
  const meta = await pipeline.metadata()
  if (meta.width && meta.width > maxW) {
    pipeline = sharp(full).resize({ width: maxW, withoutEnlargement: true })
  } else {
    pipeline = sharp(full)
  }

  await pipeline.jpeg({ quality: 86 }).toFile(tmp)
  if (outPath !== full && fs.existsSync(full)) fs.unlinkSync(full)
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  fs.renameSync(tmp, outPath)
  console.log("optimized", file, "->", outPath, fs.statSync(outPath).size)
}
