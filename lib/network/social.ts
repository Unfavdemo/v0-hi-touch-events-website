export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  email?: string;
  website?: string;
};

export function parseSocialLinks(raw: unknown): SocialLinks {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const pick = (key: string) => {
    const v = obj[key];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  return {
    instagram: pick("instagram"),
    facebook: pick("facebook"),
    tiktok: pick("tiktok"),
    linkedin: pick("linkedin"),
    email: pick("email"),
    website: pick("website"),
  };
}

function handleFrom(value: string): string {
  return value.replace(/^@/, "").replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? value;
}

export function socialHref(
  network: "instagram" | "facebook" | "tiktok" | "linkedin",
  value: string,
): string {
  if (/^https?:\/\//i.test(value)) return value;
  if (network === "linkedin") {
    const trimmed = value.replace(/^@/, "").replace(/^\/+/, "");
    if (/linkedin\.com/i.test(trimmed)) {
      return `https://${trimmed.replace(/^https?:\/\//i, "")}`;
    }
    if (/^(in|company|school)\//i.test(trimmed)) {
      return `https://www.linkedin.com/${trimmed}`;
    }
    return `https://www.linkedin.com/in/${handleFrom(trimmed)}`;
  }
  const handle = handleFrom(value);
  switch (network) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
  }
}

export function socialLabel(
  network: "instagram" | "facebook" | "tiktok" | "linkedin",
  value: string,
): string {
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const path = url.pathname.replace(/\/+$/, "");
      const last = path.split("/").filter(Boolean).pop();
      if (network === "linkedin") return last ? last.replace(/^@/, "") : url.hostname.replace(/^www\./, "");
      return url.hostname.replace(/^www\./, "");
    } catch {
      return value;
    }
  }
  const handle = handleFrom(value);
  if (network === "facebook" || network === "linkedin") return handle;
  return `@${handle}`;
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function portraitUrl(profile: {
  type: "INDIVIDUAL" | "BUSINESS";
  headshotUrl?: string | null;
  logoUrl?: string | null;
}): string | null {
  const url = profile.type === "BUSINESS" ? profile.logoUrl : profile.headshotUrl;
  return url?.trim() || null;
}

export function websiteHref(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function websiteLabel(value: string): string {
  try {
    const url = new URL(websiteHref(value));
    return url.hostname.replace(/^www\./, "") + (url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, ""));
  } catch {
    return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }
}

/** Digits-only (keeps a leading +) for tel: and sms: links. */
export function phoneHref(phone: string, kind: "tel" | "sms"): string {
  const compact = phone.replace(/[^\d+]/g, "");
  return `${kind}:${compact}`;
}
