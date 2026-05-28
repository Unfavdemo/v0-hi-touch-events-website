import { createHmac, timingSafeEqual } from "node:crypto"

function getSecret() {
  return process.env.TRACKING_SECRET?.trim() ?? process.env.AUTH_SECRET?.trim() ?? ""
}

export function buildProposalToken(engagementId: string): string | null {
  const secret = getSecret()
  if (!secret) return null
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000
  const payload = JSON.stringify({ eid: engagementId, exp })
  const body = Buffer.from(payload, "utf8").toString("base64url")
  const sig = createHmac("sha256", secret).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verifyProposalToken(token: string): { engagementId: string } | null {
  const secret = getSecret()
  if (!secret || !token.includes(".")) return null
  const [body, sig] = token.split(".")
  if (!body || !sig) return null
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("base64url")
  try {
    const a = Buffer.from(sig, "utf8")
    const b = Buffer.from(expected, "utf8")
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  try {
    const json = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      eid?: string
      exp?: number
    }
    if (!json.eid || typeof json.exp !== "number" || json.exp < Date.now()) return null
    return { engagementId: json.eid }
  } catch {
    return null
  }
}

export function buildProposalUrl(engagementId: string): string | null {
  const token = buildProposalToken(engagementId)
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (!token || !base) return null
  return `${base}/vendor-proposal/${token}`
}
