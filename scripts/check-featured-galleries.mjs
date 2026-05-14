/**
 * Lists each featured-work case study gallery: complete vs missing slots 01–06.
 * Run from repo root: npm run galleries:check
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { FEATURED_WORK_GALLERY_SLOT_COUNT } from "../lib/featured-gallery-constants.js"
import { resolveSlotFilename } from "../lib/featured-gallery.js"
import { featuredProjects } from "../lib/site.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const BASE = path.join(ROOT, "public", "images", "featured-work")

const complete = []
const incomplete = []

for (const p of featuredProjects) {
  const dir = path.join(BASE, p.slug)
  const missing = []
  const otherFiles = []

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    for (let i = 1; i <= FEATURED_WORK_GALLERY_SLOT_COUNT; i++) missing.push(String(i).padStart(2, "0"))
    incomplete.push({ slug: p.slug, title: p.title, missing, otherFiles })
    continue
  }

  for (const name of fs.readdirSync(dir)) {
    if (name === ".gitkeep" || name.startsWith(".")) continue
    const fp = path.join(dir, name)
    if (!fs.statSync(fp).isFile()) continue
    if (/^\d{2}\.(webp|jpe?g|png)$/i.test(name)) continue
    otherFiles.push(name)
  }

  for (let i = 1; i <= FEATURED_WORK_GALLERY_SLOT_COUNT; i++) {
    if (!resolveSlotFilename(dir, i)) missing.push(String(i).padStart(2, "0"))
  }

  if (missing.length) {
    incomplete.push({ slug: p.slug, title: p.title, missing, otherFiles })
  } else {
    complete.push(p.slug)
  }
}

console.log(`Gallery slots required: ${FEATURED_WORK_GALLERY_SLOT_COUNT} (01 … 06) under public/images/featured-work/<slug>/\n`)
console.log(`Complete (${complete.length}): ${complete.length ? complete.join(", ") : "— none —"}\n`)
console.log(`Incomplete (${incomplete.length}): every row is missing ${FEATURED_WORK_GALLERY_SLOT_COUNT} correctly named slots unless noted.\n`)

for (const r of incomplete) {
  const n = r.missing.length
  console.log(`• ${r.slug}`)
  console.log(`  Missing: ${n} of ${FEATURED_WORK_GALLERY_SLOT_COUNT} (slots: ${r.missing.join(", ")})`)
  if (r.otherFiles.length) {
    console.log(`  You already have ${r.otherFiles.length} file(s) here — rename/copy to 01.jpg … 06.jpg in story order:`)
    for (const f of r.otherFiles) console.log(`    - ${f}`)
  } else {
    console.log(`  No image files in folder yet (only .gitkeep).`)
  }
  console.log("")
}

process.exit(0)
