/**
 * Build iOS/Safari-friendly H.264 MP4 from `public/videos/ht-sizzle.webm`.
 * Run: npm run video:hero-mp4
 */
import { spawnSync } from "node:child_process"
import ffmpegPath from "ffmpeg-static"
import path from "node:path"

const root = process.cwd()
const inFile = path.join(root, "public", "videos", "ht-sizzle.webm")
const outFile = path.join(root, "public", "videos", "ht-sizzle.mp4")

const r = spawnSync(
  ffmpegPath,
  [
    "-y",
    "-i",
    inFile,
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-crf",
    "28",
    "-an",
    outFile,
  ],
  { stdio: "inherit" },
)

if (r.status !== 0) process.exit(r.status ?? 1)
console.log("Wrote", path.relative(root, outFile))
