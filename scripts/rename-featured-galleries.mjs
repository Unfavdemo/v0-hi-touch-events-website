/**
 * Renames loose image files in each `public/images/featured-work/<slug>/` folder
 * to `01.jpg` … `06.<ext>` (natural sort). Skips folders that already have six
 * correctly named slots, or that don’t have exactly six “other” images.
 *
 * Run: node scripts/rename-featured-galleries.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { FEATURED_WORK_GALLERY_SLOT_COUNT } from "../lib/featured-gallery-constants.js"
import { featuredProjects } from "../lib/site.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const BASE = path.join(ROOT, "public", "images", "featured-work")
const IMAGE_EXT = /\.(webp|jpe?g|png)$/i

function isSlotFilename(name) {
  return /^0[1-6]\.(webp|jpe?g|png)$/i.test(name)
}

function normalizeExt(ext) {
  const e = ext.toLowerCase()
  if (e === ".jpeg") return ".jpg"
  return e
}

for (const p of featuredProjects) {
  const dir = path.join(BASE, p.slug)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.log(`skip ${p.slug}: no folder`)
    continue
  }

  const names = fs
    .readdirSync(dir)
    .filter((n) => n !== ".gitkeep" && !n.startsWith(".") && IMAGE_EXT.test(n))
    .filter((n) => fs.statSync(path.join(dir, n)).isFile())

  const slotNames = names.filter(isSlotFilename)
  const loose = names.filter((n) => !isSlotFilename(n))

  if (slotNames.length === FEATURED_WORK_GALLERY_SLOT_COUNT && loose.length === 0) {
    console.log(`ok   ${p.slug}: already 01–06`)
    continue
  }

  if (loose.length !== FEATURED_WORK_GALLERY_SLOT_COUNT) {
    console.log(
      `skip ${p.slug}: need exactly ${FEATURED_WORK_GALLERY_SLOT_COUNT} non-slot images, have ${loose.length} (slots=${slotNames.length})`,
    )
    continue
  }

  const sorted = [...loose].sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
  const stamp = `.tmp-rename-${Date.now()}`

  /** Stage 1 → unique temp names (avoid overwrite). */
  sorted.forEach((name, i) => {
    const from = path.join(dir, name)
    const ext = normalizeExt(path.extname(name))
    const tmp = path.join(dir, `${String(i + 1).padStart(2, "0")}${stamp}${ext}`)
    fs.renameSync(from, tmp)
  })

  /** Stage 2 → final 01…06. */
  sorted.forEach((_, i) => {
    const ext = normalizeExt(path.extname(sorted[i]))
    const tmp = path.join(dir, `${String(i + 1).padStart(2, "0")}${stamp}${ext}`)
    const to = path.join(dir, `${String(i + 1).padStart(2, "0")}${ext}`)
    fs.renameSync(tmp, to)
  })

  console.log(`done ${p.slug} → 01…06 (${sorted.length} files)`)
}
