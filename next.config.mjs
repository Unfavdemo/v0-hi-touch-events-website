/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next 16 requires every local `next/image` src to match `localPatterns`.
    // Omitting `search` allows any (or no) query string, so `?v=YYYYMMDD` cache-busts work when a source file is replaced in place.
    localPatterns: [{ pathname: "/**" }],
  },
  // `lib/featured-gallery.js` reads from `public/` at request time. Without
  // explicit excludes, Next's file tracer would bundle huge static assets
  // (event photos, videos, PDFs) into every serverless function for the
  // `/featured-work/[slug]` route and blow past Vercel's 300MB lambda limit.
  // These files are already served as static assets by the CDN, so nothing
  // inside the function needs them.
  outputFileTracingExcludes: {
    "/featured-work/**": [
      "public/Hitouch Pictures/**",
      "public/images/featured-work/**",
      "public/videos/**",
      "public/*.pdf",
      "public/*.mov",
    ],
    "*": [
      "public/Hitouch Pictures/**",
      "public/images/featured-work/**",
      "public/videos/**",
      "public/*.pdf",
      "public/*.mov",
    ],
  },
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
      { source: "/images/featured-work/:path*", headers: [{ key: "Cache-Control", value: hitouchPhotos }] },
      { source: "/Hitouch Pictures/:path*", headers: [{ key: "Cache-Control", value: hitouchPhotos }] },
      { source: "/videos/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon.svg", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/Logos/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
    ]
  },
  async redirects() {
    return [
      { source: "/HiTouch_final.png", destination: "/Logos/HiTouch_final.png", permanent: true },
      { source: "/hitouch-icon-32.png", destination: "/Logos/hitouch-icon-32.png", permanent: true },
      { source: "/hitouch-icon-48.png", destination: "/Logos/hitouch-icon-48.png", permanent: true },
      { source: "/hitouch-icon-192.png", destination: "/Logos/hitouch-icon-192.png", permanent: true },
      { source: "/apple-touch-icon.png", destination: "/Logos/apple-touch-icon.png", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/social-feed", destination: "/featured-work", permanent: true },
      {
        source: "/featured-work/odaat-hope-for-the-holidays",
        destination: "/featured-work/odaat-community-events",
        permanent: true,
      },
      {
        source: "/featured-work/odaat-a-season-of-gratitude",
        destination: "/featured-work/odaat-community-events",
        permanent: true,
      },
      {
        source: "/featured-work/frankford-cdc-holiday-festival-2025",
        destination: "/featured-work/community-heros-brunch-2025",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
