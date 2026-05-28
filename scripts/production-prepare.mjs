#!/usr/bin/env node
/**
 * Run before production deploy (also wired as `prebuild` unless skipped).
 *
 *   npm run production:prepare
 *   SKIP_PRODUCTION_PREPARE=1 npm run build   # CI / quick local builds
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

if (process.env.SKIP_PRODUCTION_PREPARE === "1") {
  console.log("production:prepare skipped (SKIP_PRODUCTION_PREPARE=1)")
  process.exit(0)
}

function run(label, cmd, args) {
  console.log(`\n▶ ${label}`)
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" })
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed`)
    process.exit(r.status ?? 1)
  }
}

function bumpPublicAssetVersion() {
  const file = path.join(root, "lib", "public-asset-version.js")
  const src = fs.readFileSync(file, "utf8")
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const match = src.match(/PUBLIC_ASSET_VERSION = "(\d{8})([a-z])?"/)
  let suffix = "a"
  if (match && match[1] === stamp && match[2]) {
    suffix = String.fromCharCode(match[2].charCodeAt(0) + 1)
  }
  const next = `${stamp}${suffix}`
  const updated = src.replace(/PUBLIC_ASSET_VERSION = "[^"]+"/, `PUBLIC_ASSET_VERSION = "${next}"`)
  if (!match && updated === src) {
    console.warn("Could not bump PUBLIC_ASSET_VERSION — pattern not found")
    return
  }
  fs.writeFileSync(file, updated)
  console.log(`\n✓ PUBLIC_ASSET_VERSION → ${next}`)
}

console.log("═══ HiTouch production prepare ═══")

run("Optimize event & gallery photos", "node", ["scripts/optimize-event-photos.mjs"])
run("Optimize team headshots", "node", ["scripts/optimize-team-headshots.mjs"])
run("Check featured-work galleries", "node", ["scripts/check-featured-galleries.mjs"])

bumpPublicAssetVersion()

console.log("\n═══ Done. Run `npm run build` to verify. ═══\n")
