import { createHmac, timingSafeEqual } from "node:crypto"

function getSecret() {
  return process.env.TRACKING_SECRET?.trim() ?? process.env.AUTH_SECRET?.trim() ?? ""
}

export function buildOpenTrackingUrl(messageId: string): string | null {
  const secret = getSecret()
  if (!secret) return null
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = JSON.stringify({ mid: messageId, exp })
  const body = Buffer.from(payload, "utf8").toString("base64url")
  const sig = createHmac("sha256", secret).update(body).digest("base64url")
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""
  if (!base) return null
  return `${base}/api/track/email?p=${body}&s=${sig}`
}

/** Appends a 1×1 transparent tracking pixel before `</body>` when possible (invisible to readers; loads when images are enabled). */
export function appendOpenTrackingPixel(html: string, messageId: string): string {
  const url = buildOpenTrackingUrl(messageId)
  if (!url) return html
  // Avoid visibility:hidden / display:none — some clients skip loading those. Keep physically tiny + low contrast.
  const pixel = `<img src="${url}" alt="" width="1" height="1" border="0" role="presentation" aria-hidden="true" style="display:block;width:1px!important;height:1px!important;max-width:1px!important;max-height:1px!important;margin:0!important;padding:0!important;border:0!important;line-height:0!important;font-size:0!important;opacity:0.01;overflow:hidden;mso-hide:all;" />`
  if (html.toLowerCase().includes("</body>")) {
    return html.replace(/<\/body>/i, `${pixel}</body>`)
  }
  return `${html}\n${pixel}`
}

export function verifyOpenTrackingRequest(p: string, s: string): { messageId: string } | null {
  const secret = getSecret()
  if (!secret || !p || !s) return null
  const expected = createHmac("sha256", secret).update(p, "utf8").digest("base64url")
  try {
    const a = Buffer.from(s, "utf8")
    const b = Buffer.from(expected, "utf8")
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  try {
    const json = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as { mid?: string; exp?: number }
    if (!json.mid || typeof json.exp !== "number" || json.exp < Date.now()) return null
    return { messageId: json.mid }
  } catch {
    return null
  }
}
