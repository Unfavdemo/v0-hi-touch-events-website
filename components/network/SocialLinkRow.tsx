import {
  parseSocialLinks,
  socialHref,
  socialLabel,
  websiteHref,
  websiteLabel,
  type SocialLinks,
} from "@/lib/network/social";

const NETWORKS = ["instagram", "facebook", "tiktok", "linkedin"] as const;

const LABELS: Record<(typeof NETWORKS)[number], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export function SocialLinkRow({ raw }: { raw: unknown }) {
  const links: SocialLinks = parseSocialLinks(raw);
  const present = NETWORKS.filter((n) => links[n]);
  if (present.length === 0 && !links.website) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {links.website ? (
        <li>
          <a
            href={websiteHref(links.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="ht-label inline-flex border-2 border-ht-line px-3 py-1.5 text-ht-blue-bright transition-colors hover:border-ht-blue-bright hover:text-ht-cream"
          >
            Website · {websiteLabel(links.website)}
          </a>
        </li>
      ) : null}
      {present.map((network) => {
        const value = links[network]!;
        return (
          <li key={network}>
            <a
              href={socialHref(network, value)}
              target="_blank"
              rel="noopener noreferrer"
              className="ht-label inline-flex border-2 border-ht-line px-3 py-1.5 text-ht-blue-bright transition-colors hover:border-ht-blue-bright hover:text-ht-cream"
            >
              {LABELS[network]} · {socialLabel(network, value)}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
