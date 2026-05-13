import fs from "node:fs"
import path from "node:path"

import { FEATURED_WORK_GALLERY_SLOT_COUNT } from "@/lib/featured-gallery-constants"

const PUBLIC_SEGMENT = path.join("public", "images", "featured-work")

/** Prefer WebP when present; otherwise common raster extensions (ASCII names only). */
const SLOT_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"]

/**
 * Returns public URL paths for a featured-work gallery when every slot exists
 * (`FEATURED_WORK_GALLERY_SLOT_COUNT` files).
 * Convention: `public/images/featured-work/{slug}/01.webp` … `06.webp` (or .jpg, etc.).
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
    const base = String(i).padStart(2, "0")
    let filename = null
    for (const ext of SLOT_EXTENSIONS) {
      const fp = path.join(dir, `${base}${ext}`)
      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        filename = `${base}${ext}`
        break
      }
    }
    if (!filename) return null
    urls.push(`/images/featured-work/${slug}/${filename}`)
  }

  return urls
}
