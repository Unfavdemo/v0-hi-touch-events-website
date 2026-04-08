/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    const immutable = "public, max-age=31536000, immutable"
    return [
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon.svg", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon-light-32x32.png", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/icon-dark-32x32.png", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/apple-icon.png", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/HiTouch_final.png", headers: [{ key: "Cache-Control", value: immutable }] },
    ]
  },
  async redirects() {
    return [{ source: "/blog", destination: "/", permanent: true }]
  },
}

export default nextConfig
