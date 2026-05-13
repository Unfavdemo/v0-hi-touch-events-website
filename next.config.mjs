/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const immutable = "public, max-age=31536000, immutable"
    /** Team headshots: long cache + SWR; rename files when replacing a portrait. */
    const teamImages =
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
    /** Event photos: avoid `must-revalidate` so repeat visits use disk cache/CDN. */
    const hitouchPhotos =
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000"
    return [
      { source: "/images/team/:path*", headers: [{ key: "Cache-Control", value: teamImages }] },
      { source: "/Hitouch Pictures/:path*", headers: [{ key: "Cache-Control", value: hitouchPhotos }] },
      { source: "/videos/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
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
      {
        source: "/featured-work/odaat-hope-for-the-holidays",
        destination: "/featured-work/odaat-a-season-of-gratitude",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
