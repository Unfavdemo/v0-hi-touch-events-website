import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/auth.config"
import { isNetworkTestHost, rewriteNetworkPath } from "@/lib/network/host"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const host = req.headers.get("host")
  const { pathname } = req.nextUrl
  const onTestHost = isNetworkTestHost(host)

  // Apex: keep network product off the public marketing/CRM site in production
  if (
    !onTestHost &&
    process.env.NODE_ENV === "production" &&
    process.env.NETWORK_ALLOW_APEX !== "1" &&
    pathname.startsWith("/network")
  ) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (onTestHost) {
    // Avoid sending test-host /admin through CRM NextAuth admin gate
    const rewritten = rewriteNetworkPath(pathname)
    if (rewritten && rewritten !== pathname) {
      const url = req.nextUrl.clone()
      url.pathname = rewritten
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set("x-pathname", rewritten)
      requestHeaders.set("x-network-test-host", "1")
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      })
    }

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-pathname", pathname)
    requestHeaders.set("x-network-test-host", "1")
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // Apex CRM / portal auth gate (existing behavior)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", pathname)
  return NextResponse.next({
    request: { headers: requestHeaders },
  })
})

export const config = {
  matcher: [
    "/",
    "/login",
    "/pending",
    "/membership-required",
    "/admin/:path*",
    "/freelancer/:path*",
    "/partner/:path*",
    "/join/:path*",
    "/legal/:path*",
    "/network",
    "/network/:path*",
    "/portal/:path*",
    "/api/vendor-documents/:path*",
    "/api/vendor-w9/:path*",
    "/api/webhooks/stripe",
  ],
}
