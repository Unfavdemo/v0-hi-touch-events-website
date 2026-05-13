/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const immutable = "public, max-age=31536000, immutable"
    /** Team headshots are edited in place; skip `immutable` so fixes reach browsers. */
    const teamImages = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400, must-revalidate"
    const hitouchPhotos =
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400, must-revalidate"
    return [
      { source: "/images/team/:path*", headers: [{ key: "Cache-Control", value: teamImages }] },
      { source: "/Hitouch Pictures/:path*", headers: [{ key: "Cache-Control", value: hitouchPhotos }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon.svg", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon-light-32x32.png", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon-dark-32x32.png", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/apple-icon.png", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/HiTouch_final.png", headers: [{ key: "Cache-Control", value: immutable }] },
    ]
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/", permanent: true },
      { source: "/social-feed", destination: "/featured-work", permanent: true },
    ]
  },
}

export default nextConfig
