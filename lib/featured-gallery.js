import fs from "node:fs"
import path from "node:path"

import { FEATURED_WORK_GALLERY_SLOT_COUNT } from "./featured-gallery-constants.js"
import { PUBLIC_ASSET_VERSION } from "./public-asset-version.js"

const PUBLIC_SEGMENT = path.join("public", "images", "featured-work")

/** Prefer WebP, then JPEG variants, then PNG when multiple slot files exist (rare). */
const EXT_RANK = /** @type {Record<string, number>} */ ({
  ".webp": 0,
  ".jpg": 1,
  ".jpeg": 1,
  ".png": 2,
})

/**
 * Resolves the on-disk filename for gallery slot `i` (1-based), case-insensitive extension
 * (e.g. `03.JPG` on Linux). Returns null if missing.
 *
 * @param {string} dir absolute path to `public/images/featured-work/{slug}`
 * @param {number} i slot index 1 … FEATURED_WORK_GALLERY_SLOT_COUNT
 * @returns {string | null}
 */
export function resolveSlotFilename(dir, i) {
  const base = String(i).padStart(2, "0")
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null
  const pattern = new RegExp(`^${base}\\.(webp|jpe?g|png)$`, "i")
  const matches = fs.readdirSync(dir).filter((name) => {
    if (name === ".gitkeep" || name.startsWith(".")) return false
    if (!pattern.test(name)) return false
    try {
      return fs.statSync(path.join(dir, name)).isFile()
    } catch {
      return false
    }
  })
  if (matches.length === 0) return null
  matches.sort((a, b) => {
    const ra = EXT_RANK[path.extname(a).toLowerCase()] ?? 99
    const rb = EXT_RANK[path.extname(b).toLowerCase()] ?? 99
    if (ra !== rb) return ra - rb
    return a.localeCompare(b, "en")
  })
  return matches[0]
}

/**
 * Returns public URL paths for a featured-work gallery when every slot exists
 * (`FEATURED_WORK_GALLERY_SLOT_COUNT` files).
 * Convention: `public/images/featured-work/{slug}/01.webp` … `06.webp` (or .jpg / .JPG, etc.).
 *
 * @param {string} slug — must match `featuredProjects[].slug` (kebab-case).
 * @returns {string[] | null} paths starting with `/images/…`, or `null` if incomplete.
 */
export function getFeaturedWorkGalleryPaths(slug) {
  if (!slug || typeof slug !== "string" || slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    return null
  }

  const dir = path.join(process.cwd(), PUBLIC_SEGMENT, slug)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null

  const urls = []
  for (let i = 1; i <= FEATURED_WORK_GALLERY_SLOT_COUNT; i++) {
    const filename = resolveSlotFilename(dir, i)
    if (!filename) return null
    const q = `v=${PUBLIC_ASSET_VERSION}`
    urls.push(`/images/featured-work/${slug}/${encodeURI(filename)}?${q}`)
  }

  return urls
}
