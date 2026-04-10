/**
 * One-shot: resize team headshots (max width 840px, ~2× for 3-up grid) and write WebP.
 * Run: node scripts/convert-team-png-to-webp.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const teamDir = path.join(__dirname, "..", "public", "images", "team")

const MAX_WIDTH = 840

const files = fs.readdirSync(teamDir).filter((f) => /\.png$/i.test(f))

for (const file of files) {
  const input = path.join(teamDir, file)
  const base = file.replace(/\.png$/i, "")
  const output = path.join(teamDir, `${base}.webp`)
  await sharp(input)
    .rotate()
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 86, effort: 4 })
    .toFile(output)
  console.log("wrote", path.relative(process.cwd(), output))
}
