import fs from "node:fs"
import crypto from "node:crypto"

const path = ".env"
let text = fs.readFileSync(path, "utf8")

for (const key of ["CRON_SECRET", "TRACKING_SECRET"]) {
  const re = new RegExp(`^(${key}=)(.*)$`, "m")
  const m = text.match(re)
  if (!m || m[2].trim()) continue
  const val = crypto.randomBytes(32).toString("base64url")
  text = text.replace(re, `$1${val}`)
  console.log(`Filled empty ${key}`)
}

fs.writeFileSync(path, text)
