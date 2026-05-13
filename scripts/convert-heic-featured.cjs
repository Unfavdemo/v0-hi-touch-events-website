/* One-off: HEIC → JPEG for featured work (Chrome-safe). Run: node scripts/convert-heic-featured.cjs */
const fs = require("node:fs/promises")
const path = require("node:path")
const convert = require("heic-convert")

const dir = path.join(__dirname, "..", "public", "Hitouch Pictures")
const files = [
  "The Grove (Mayor's VIP).HEIC",
  "The Tree Lighting Ceremony ( Mayor's VIP).HEIC",
]

;(async () => {
  for (const name of files) {
    const input = path.join(dir, name)
    const buf = await fs.readFile(input)
    const jpeg = await convert({ buffer: buf, format: "JPEG", quality: 0.92 })
    const outName = name.replace(/\.heic$/i, ".jpg")
    const output = path.join(dir, outName)
    await fs.writeFile(output, Buffer.from(jpeg))
    console.log("Wrote", outName)
  }
})()
